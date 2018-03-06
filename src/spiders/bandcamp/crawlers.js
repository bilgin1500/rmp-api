// Global modules
var request = require('requestretry');
var Promise = require('bluebird');
var _ = require('lodash');

// Local modules
var models = require('lib/models');
var flowManager = require('lib/flow-manager');
var parser = require('lib/crawlers/bandcamp/parser');
var bandcamp = require('config').bandcamp;
var limiter = require('config/limiter')();

// created_by & updated_by fields in db
var source = 'bandcamp';

/**
 * Bandcamp scraping flow managers
 * These functions manage the async scraping flow using page parsers
 */
module.exports = {
  /**
   * Scraps given Bandcamp tag pages and exports artist names and Bandcamp urls
   * https://bandcamp.com/tag/{tag-name}?page={page-number}
   */
  'tag-pages': function(req, res) {
    // Testing limits
    if (limiter.enable) {
      bandcamp.tags.length = limiter.pages;
      bandcamp.maxPagesToScrap = limiter.paging;
    }

    // Exclude the annoying duplicate error
    var handleDbError = function(err) {
      if (err.code != 'ER_DUP_ENTRY') {
        res.locals.sse.send({ event: 'error', data: err });
      }
    };

    var pagesToCrawl = [];

    // Find all urls to be crawled
    for (var tagNo = 0; tagNo < bandcamp.tags.length; tagNo++) {
      for (var pageNo = 0; pageNo < bandcamp.maxPagesToScrap; pageNo++) {
        var url = bandcamp.url +
          bandcamp.tagPath +
          bandcamp.tags[tagNo] +
          '?page=' +
          parseInt(pageNo + 1);
        pagesToCrawl.push({ url: url, fullResponse: false });
      }
    }

    // Crawl tag pages
    return flowManager(
      {
        name: 'Crawling Bandcamp tag pages' + limiter.message,
        dataset: pagesToCrawl,
        task: function(args, req, res) {
          return request(args, req, res);
        },
        parser: parser['tag-page']
      },
      req,
      res
    ).then(function(dataset) {
      // Flatten our main dataset
      var processedDataset = _.flatten(_.map(dataset, 'response'));

      // Insert artists
      return flowManager(
        {
          name: 'Inserting artists to database' + limiter.message,
          dataset: (function() {
            return _.map(processedDataset, function(data) {
              return {
                name: data.artistName,
                created_by: source
              };
            });
          })(),
          task: function(args, req, res) {
            return models.Artist.findOrCreate(args, req, res);
          },
          parser: function(artist) {
            return { artistId: artist.id };
          }
        },
        req,
        res
      ).then(function(allArtistsIds) {
        // We'll add the artist ids to our main dataset
        processedDataset = _.merge(
          processedDataset,
          _.map(allArtistsIds, 'response')
        );

        // Insert albums
        return flowManager(
          {
            name: 'Inserting albums to database' + limiter.message,
            dataset: (function() {
              return _.map(processedDataset, function(data) {
                return {
                  name: data.albumName,
                  artist_id: data.artistId,
                  created_by: source
                };
              });
            })(),
            task: function(args, req, res) {
              return models.Album.findOrCreate(args, req, res);
            },
            parser: function(album) {
              return { albumId: album.id };
            }
          },
          req,
          res
        ).then(function(allAlbumIds) {
          // We'll add the album ids to our main dataset
          processedDataset = _.merge(
            processedDataset,
            _.map(allAlbumIds, 'response')
          );

          res.locals.sse.send({
            event: 'message',
            data: '"Inserting related album and artist url" begins...' +
              limiter.message
          });

          // Finally add the urls
          for (var i = 0; i < processedDataset.length; i++) {
            models.Url
              .create({
                href: processedDataset[i].artistUrl,
                type: source,
                created_by: source,
                ref_type: 'artists',
                ref_id: processedDataset[i].artistId
              })
              .catch(handleDbError);

            models.Url
              .create({
                href: processedDataset[i].albumUrl,
                type: source,
                created_by: source,
                ref_type: 'albums',
                ref_id: processedDataset[i].albumId
              })
              .catch(handleDbError);
          }

          res.locals.sse.send({
            event: 'success',
            data: '"Inserting related album and artist url" finished.'
          });

          return processedDataset;
        });
      });
    });
  },

  /**
   * Scraps Bandcamp individual music pages
   * https://{band-name}.bandcamp.com/music/
   */
  'music-pages': function(req, res) {
    // Exclude the annoying duplicate error
    var handleDbError = function(err) {
      if (err.code != 'ER_DUP_ENTRY' && err.message != 'No Rows Deleted') {
        res.locals.sse.send({ event: 'error', data: err });
      }
    };

    // Process all final data (by flowmanager)
    function crud(processedDataset) {
      var i;

      // The destroyer
      if (processedDataset.error) {
        models.Artist
          .destroy({ id: processedDataset.artistId })
          .then()
          .catch(handleDbError);
        return Promise.resolve();
      }

      // Urls
      if (processedDataset.urls) {
        for (i = 0; i < processedDataset.urls.length; i++) {
          models.Url
            .create({
              href: processedDataset.urls[i].href,
              type: processedDataset.urls[i].type,
              created_by: source,
              ref_type: 'artists',
              ref_id: processedDataset.artistId
            })
            .catch(handleDbError);
        }
      }

      // Media info
      if (processedDataset.bio) {
        models.Medium
          .create({
            type: 'text',
            category: 'bio',
            text: processedDataset.bio,
            created_by: source,
            ref_type: 'artists',
            ref_id: processedDataset.artistId
          })
          .catch(handleDbError);
      }

      // Profile photo
      if (processedDataset.profile) {
        models.Medium
          .create({
            type: 'image',
            category: 'profile photo',
            text: processedDataset.profile.caption,
            created_by: source,
            ref_type: 'artists',
            ref_id: processedDataset.artistId
          })
          .catch(handleDbError);
      }

      // Albums
      if (processedDataset.albums) {
        // Update and insert response
        flowManager(
          {
            dataset: (function() {
              return _.map(processedDataset.albums, function(album) {
                return _.extend({}, album, {
                  artistId: processedDataset.artistId
                });
              });
            })(),
            task: function() {
              return models.Album.upsert(
                {
                  name: args.name,
                  artist_id: args.artistId
                },
                {
                  release_date: args.releaseDate,
                  created_by: source,
                  updated_by: source,
                  bandcamp_id: args.id
                }
              );
            },
            parser: function(album, currentDataset) {
              var albumUrl;

              if (currentDataset.url.charAt(0) === '/') {
                albumUrl = processedDataset.url + currentDataset.url;
              } else {
                albumUrl = currentDataset.url;
              }

              // Insert album urls
              models.Url
                .create({
                  href: albumUrl,
                  type: source,
                  created_by: source,
                  ref_type: 'albums',
                  ref_id: album.id
                })
                .catch(handleDbError);
            }
          },
          req,
          res
        );
      }

      return Promise.resolve();
    }

    // Get all artist urls
    return models.Urls
      .forge()
      .query(function(qb) {
        qb.where({
          type: source,
          ref_type: 'artists'
        });

        if (limiter.enable) {
          qb += qb.limit(limiter.query).offset(0);
        }
      })
      .fetch({ require: true })
      .then(function(dataset) {
        var processedDataset = dataset.serialize();

        // Crawl artists' music pages
        return flowManager(
          {
            name: 'Crawling Bandcamp music pages' + limiter.message,
            dataset: (function() {
              return _.map(processedDataset, function(url) {
                return { url: url.href + '/music', fullResponse: false };
              });
            })(),
            task: function(args, req, res) {
              return request(args, req, res);
            },
            parser: parser['music-page-proxy']
          },
          req,
          res
        ).then(function(response) {
          /**
           * Merge database data with crawling response
           * @type {Array}
           *
           * processedDataset: [{
           *    "artistId": 1,
           *    "url": "https://shepastawayofficial.bandcamp.com",
           *    "urls":[
           *      {"href":"https://www.facebook.com/shepastaway","type":"facebook"},
           *      {"href":"https://www.youtube.com/user/gorecan/videos","type":"youtube"},
           *      {"href":"https://soundcloud.com/shepastaway","type":"soundcloud"}
           *    ],
           *    "bio":"bio text",
           *    "profile":{
           *      "href":"https://f4.bandcampbits.com/img/0005663494_10.jpg",
           *      "caption":"She Past Away image"
           *    },
           *    "albums":[{
           *      "url":"/album/volume-i-ii",
           *      "id":3735577250,
           *      "title":"Album title",
           *      "releaseDate":"2017-01-27 00:00:00"
           *    }]
           *  }]
           */
          processedDataset = _.merge(
            _.map(processedDataset, function(data) {
              return { artistId: data.ref_id, url: data.href };
            }),
            _.map(response, 'response')
          );

          // Update/insert/delete
          return flowManager(
            {
              name: 'Inserting, updating and deleting artists & albums' +
                limiter.message,
              dataset: processedDataset,
              task: function(args, req, res) {
                return crud(args, req, res);
              }
            },
            req,
            res
          ).then(function() {
            return processedDataset;
          });
        });
      })
      .catch(handleDbError);
  },

  'album-pages': function(req, res) {
    // Exclude the annoying duplicate error
    var handleDbError = function(err) {
      if (err.code != 'ER_DUP_ENTRY') {
        res.locals.sse.send({ event: 'error', data: err });
      }
    };

    // Process all final data (by flowmanager)
    function crud(processedDataset) {
      // Artist's Bandcamp id
      if (processedDataset.bcArtistId) {
        models.Artist
          .update(
            {
              bandcamp_id: processedDataset.bcArtistId,
              updated_by: source
            },
            {
              id: processedDataset.artistId
            }
          )
          .catch(handleDbError);
      }

      // Albums
      if (processedDataset.album) {
        // Album
        models.Album
          .update(
            {
              name: processedDataset.album.name,
              release_date: processedDataset.album.releaseDate,
              bandcamp_id: processedDataset.album.bcId,
              updated_by: source
            },
            {
              id: processedDataset.albumId
            }
          )
          .then(function(albumModel) {
            // About
            if (processedDataset.album.about) {
              models.Medium
                .create({
                  type: 'text',
                  category: 'about',
                  text: processedDataset.album.about,
                  created_by: source,
                  ref_type: 'albums',
                  ref_id: processedDataset.albumId
                })
                .catch(handleDbError);
            }

            // Credits
            if (processedDataset.album.credits) {
              models.Medium
                .create({
                  type: 'text',
                  category: 'credits',
                  text: processedDataset.album.credits,
                  created_by: source,
                  ref_type: 'albums',
                  ref_id: processedDataset.albumId
                })
                .catch(handleDbError);
            }

            // Cover
            if (processedDataset.album.cover) {
              models.Medium
                .create({
                  type: 'image',
                  category: 'album cover',
                  text: processedDataset.album.cover.caption,
                  href: processedDataset.album.cover.href,
                  created_by: source,
                  ref_type: 'albums',
                  ref_id: processedDataset.albumId
                })
                .catch(handleDbError);
            }

            // Tags
            if (processedDataset.album.tags.length > 0) {
              _.forEach(processedDataset.album.tags, function(tag) {
                models.Tag
                  .findOrCreate({ name: tag, created_by: source })
                  .then(function(tagModel) {
                    tagModel
                      .related('albums')
                      .attach(albumModel)
                      .catch(handleDbError);
                  })
                  .catch(handleDbError);
              });
            }

            // Tracks
            if (processedDataset.album.tracks.length > 0) {
              _.forEach(processedDataset.album.tracks, function(track) {
                // Track data
                models.Track
                  .findOrCreate({
                    name: track.name,
                    track_num: track.trackNum,
                    bandcamp_id: track.bcId,
                    created_by: source,
                    album_id: processedDataset.albumId
                  })
                  .then(function(trackModel) {
                    if (track.file && track.duration) {
                      // Track media
                      models.Medium
                        .create({
                          type: 'audio',
                          category: 'track',
                          duration: track.duration,
                          href: track.file,
                          created_by: source,
                          ref_type: 'tracks',
                          ref_id: trackModel.id
                        })
                        .catch(handleDbError);
                    }
                  })
                  .catch(handleDbError);
              });
            }
          })
          .catch(handleDbError);
      }

      return Promise.resolve();
    }

    // Get all artist urls
    models.Urls
      .forge()
      .query(function(qb) {
        qb.where({
          type: source,
          ref_type: 'albums'
        });

        if (limiter.enable) {
          qb += qb.limit(limiter.query).offset(0);
        }
      })
      .fetch({ require: true })
      .then(function(dataset) {
        var processedDataset = dataset.serialize();

        // Crawl artists' music pages
        flowManager(
          {
            name: 'Crawling Bandcamp album pages' + limiter.message,
            dataset: (function() {
              return _.map(processedDataset, function(url) {
                return { url: url.href, fullResponse: false };
              });
            })(),
            task: function(args, req, res) {
              return request(args, req, res);
            },
            parser: parser['album-page']
          },
          req,
          res
        ).then(function(response) {
          /**
           * Merge database data with crawling response
           * @type {Array}
           *
           * processedDataset: [{
           *   "artistId": 3,
           *   "bcArtistId":4164136673,
           *   "albumId": 3,
           *   "album": {
           *     "bcId":1504052127,
           *     "name":"XX",
           *     "credits": "credits text...",
           *     "about": "about text...",
           *     "releaseDate":"2017-01-27 00:00:00",
           *     "cover": {
           *       "href:": "",
           *       "caption": ""
           *     },
           *     "tags": ["tag1","tag2"]
           *     "tracks":[{
           *       "name":"Özgür Ruh (Free Spirit)",
           *       "trackNum":1,
           *       "bcId":1554552916,
           *       "duration":194.2,
           *       "file":"track url"
           *     }]
           *   }
           * }}
           */
          // Find all the artist id's and merge them with response
          Promise.map(processedDataset, function(data) {
            return models.Album
              .findOne({ id: data.ref_id })
              .then(function(album) {
                return {
                  artistId: album.get('artist_id'),
                  albumId: data.ref_id
                };
              });
          }).then(function(data) {
            // Final dataset
            processedDataset = _.merge(data, _.map(response, 'response'));

            // Update/insert/delete
            flowManager(
              {
                name: 'Inserting, updating and deleting albums' +
                  limiter.message,
                dataset: processedDataset,
                task: function(args, req, res) {
                  return crud(args, req, res);
                }
              },
              req,
              res,
              function() {
                done(processedDataset);
              }
            );
          });
        });
      });
  }
};
