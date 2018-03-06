// Global modules
import cheerio from 'cheerio';
import moment from 'moment';

// Local modules
import bc_config from './config';
import globals from 'lib/globals';

const searchPage = (response, type) => {
  let result = [];

  const $ = cheerio.load(response);
  const $searchItems = $(bc_config.selectors.searchPage.$searchItem);

  if ($searchItems.length > 0) {
    $searchItems.each((index, searchItem) => {
      const $searchItem = $(searchItem);

      if (
        $searchItem.hasClass(
          bc_config.selectors.searchPage.$searchItemTypeClass[type]
        )
      ) {
        let name = $searchItem
          .find(bc_config.selectors.searchPage.$searchItemName)
          .text()
          .trim();
        let $url = $searchItem.find(
          bc_config.selectors.searchPage.$searchItemUrl
        );
        let url = $url.text();
        let image = $searchItem
          .find(bc_config.selectors.searchPage.$searchItemThumb)
          .attr('src');
        let id = $url.attr('href').split('&')[1].replace('search_item_id=', '');

        let detail = '';

        let genre = $searchItem
          .find(bc_config.selectors.searchPage.$searchItemGenre)
          .text()
          .trim()
          .replace('genre:', '')
          .replace(/\s+/g, ' ');
        let releases = $searchItem
          .find(bc_config.selectors.searchPage.$searchItemReleases)
          .text()
          .trim()
          .replace('releases:', '')
          .replace(/\s+/g, ' ');
        let tags = $searchItem
          .find(bc_config.selectors.searchPage.$searchItemTags)
          .text()
          .trim()
          .replace('tags:', '')
          .replace(/\s+/g, ' ');

        if (genre) {
          detail += '<strong>Genre:</strong> ' + genre + '<br/>';
        }

        if (releases) {
          detail += '<strong>Releases:</strong> ' + releases + '<br/>';
        }

        if (tags) {
          detail += '<strong>Tags:</strong> ' + tags + '<br/>';
        }

        result.push({
          id: id,
          name: name,
          url: url,
          detail: detail,
          image: image
        });
      }
    });
  }

  return result;
};

/**
 * Parses Bandcamp tag page (new arrivals)
 * https://bandcamp.com/tag/{tag-name}?page={page-number}
 *
 * response: Raw HTML body
 *
 * return: [{artistName:S, artistUrl:S, albumName:S, albumUrl:S}]
 */
const tagPage = response => {
  var $ = cheerio.load(response);
  var $albumWrapper = $(bc_config.selectors.tagPage.$albumWrapper);

  var result = [];

  if ($albumWrapper.length > 0) {
    $albumWrapper.each(element => {
      var $this = $(element);

      // The things we can scrap
      var artistName = $this
        .find(bc_config.selectors.tagPage.$artistName)
        .text();
      var albumName = $this.find(bc_config.selectors.tagPage.$albumName).text();
      var albumUrl = $this.find('a').attr('href');
      var artistUrlArr = albumUrl.split('/');
      var artistUrl = artistUrlArr[0] + '//' + artistUrlArr[2];

      result.push({
        artistName: artistName,
        artistUrl: artistUrl,
        albumName: albumName,
        albumUrl: albumUrl
      });
    });
  }

  return result;
};

/**
 * Checks the music page and defines the approtiate parser
 * Response is the raw HTML body
 * 
 * The routes we can follow on this page:
 *  - Sometimes this page redirects to /releases page which contains only one album
 *  - Sometimes this page doesn't belong to a band or artist but to a records company
 *  - Sometimes location is different than Turkey.
 *  - Sometimes there is no album only tracks
 */
const musicPageProxy = response => {
  var $ = cheerio.load(response);

  // The things we can scrap
  var albumData = $(bc_config.selectors.musicPage.$artistAlbumWrapper).attr(
    bc_config.selectors.musicPage.$allAlbumsData
  );
  var artistLocation = $(bc_config.selectors.sidebar.$artistLocation)
    .text()
    .toLowerCase();
  var isLabel = $('.leftMiddleColumns').find(
    bc_config.selectors.musicPage.$labelMenu
  ).length;

  // In Turkey
  if (~artistLocation.indexOf('turkey')) {
    // Label page
    if (isLabel > 0) {
      return { error: 'A label account' };

      // Music or Album page
    } else {
      var sidebarInfo = module.exports.sidebar(response);

      // Music page
      if (albumData) {
        return Object.assign({}, sidebarInfo, musicPage(response));

        // Album page
      } else {
        return sidebarInfo;
      }
    }

    // Not in Turkey
  } else {
    return { error: 'Not in Turkey' };
  }
};

/**
 * Parses Bandcamp sidebar
 * On almost every Bandcamp page there is a right sidebar consisting artist's info
 * 
 * response: Raw HTML body
 *
 * return: [{urls:[{href:S, type:S}], bio:S, profile:{href:S, caption:S}]
 */
const sidebar = response => {
  var $ = cheerio.load(response);

  // The things we can scrap
  var $artistBio = $(bc_config.selectors.sidebar.$artistBio);
  var $artistPhoto = $(bc_config.selectors.sidebar.$artistPhoto);
  var $artistLinks = $(bc_config.selectors.sidebar.$artistLinks);

  var result = {};

  // Social links
  if ($artistLinks.length > 0) {
    result.urls = [];

    $artistLinks.each(function(i, link) {
      var $link = $(link);
      var linkHref = $link.attr('href').replace('?ref=bookmarks', '');
      var linkTitle = $link.text().toLowerCase().trim();

      if (globals.sourceTypes.indexOf(linkTitle) == -1) {
        linkTitle = 'other';
      }

      result.urls.push({ href: linkHref, type: linkTitle });
    });
  }

  // Artist bio
  if ($artistBio.length > 0) {
    //result.bio = helpers.validator.customSanitizers.removeEmptySpaces(
    $artistBio.text().replace('... more', '').trim();
    //);
  }

  // Artist rofile photo
  if ($artistPhoto.length > 0) {
    result.profile = {
      href: $(bc_config.selectors.sidebar.$artistPhoto)
        .attr('src')
        .replace('_21.jpg', '_10.jpg'),
      caption: $(bc_config.selectors.sidebar.$artistPhoto).attr('alt')
    };
  }

  return result;
};

/**
 * Parses Bandcamp album list on the music page. This parser only extracts
 * album name and id from music page. Tracks and other info will be parsed
 * by 'album-page' parser using the album url.
 * https://{{band-name}}.bandcamp.com/music
 *  
 * response: Raw HTML body
 *
 * return: {albums:[{id:N, name:S, url:S, releaseDate:D}]}
 */
const musicPage = response => {
  var $ = cheerio.load(response);

  // The things we can scrap
  var albumData = $(bc_config.selectors.musicPage.$artistAlbumWrapper).attr(
    bc_config.selectors.musicPage.$allAlbumsData
  );

  var result = {};

  // Artist's albums
  if (albumData) {
    result.albums = [];

    JSON.parse(albumData).forEach(function(album) {
      result.albums.push({
        id: album.id,
        name: album.title,
        url: album.page_url,
        releaseDate: moment(album.release_date, 'DD MMM YYYY HH:mm:ss').format(
          'YYYY-MM-DD HH:mm:ss'
        )
      });
    });
  }

  return result;
};

/**
 * Parses Bandcamp album page and extracts all the album data
 * https://{{band-name}}.bandcamp.com/album/{album-name}
 *
 * response: Raw HTML body
 *
 * return: {bcArtistId:S, album:{bcId:S, name:S, releaseDate:D, tracks:[{bcId:S, name:S,
 * trackNum:N, duration:S, file:S}], tags:[], credits:S, about:S, cover:{href:S, caption:S}}}
 */
const albumPage = response => {
  var $ = cheerio.load(response);

  var result = {};

  // The things we can scrap
  var $allScripts = $.root().find('script');
  var $albumCover = $(bc_config.selectors.albumPage.$albumCover);
  var $albumTags = $(bc_config.selectors.albumPage.$albumTags);

  if ($allScripts.length > 0) {
    $allScripts.each(function(i, elem) {
      // Extract the 'TralbumData' object from page source using eval
      let TralbumData;
      var thisContent = $(elem).text();
      var indexNo = thisContent.indexOf('TralbumData = {');

      if (indexNo > -1) {
        var thisContent2 = thisContent.substring(indexNo - 4);
        var indexNo2 = thisContent2.indexOf('};') + 2;
        var lastPart = thisContent2.slice(indexNo2);
        var thisContent3 = thisContent2.replace(lastPart, '');
        eval(thisContent3); // jshint ignore:line

        if (TralbumData.current) {
          // Album base
          result = {
            bcArtistId: TralbumData.current.band_id,
            album: {
              bcId: TralbumData.current.id,
              name: TralbumData.current.title,
              releaseDate: moment(
                TralbumData.current.release_date,
                'DD MMM YYYY HH:mm:ss'
              ).format('YYYY-MM-DD HH:mm:ss'),
              tracks: [],
              tags: []
            }
          };

          // Album credits
          if (TralbumData.current.credits) {
            result.album.credits = TralbumData.current.credits;
          }

          // Album about
          if (TralbumData.current.about) {
            result.album.about = TralbumData.current.about;
          }

          // Album cover
          if ($albumCover.length > 0) {
            result.album.cover = {
              href: $albumCover.attr('href'),
              caption: TralbumData.current.title + ' cover art'
            };
          }

          // Album tags
          if ($albumTags.length > 0) {
            $albumTags.each(function(i, $tag) {
              result.album.tags.push($($tag).text());
            });
          }

          // Album tracks
          if (TralbumData.trackinfo) {
            var track;

            TralbumData.trackinfo.forEach(function(trackData) {
              track = {
                bcId: trackData.track_id,
                name: trackData.title,
                trackNum: trackData.track_num
              };

              if (trackData.file && trackData.file['mp3-128']) {
                track.duration = trackData.duration;
                track.file = trackData.file['mp3-128'];
              }

              result.album.tracks.push(track);
            });
          }
        }
      }
    });
  }

  return result;
};

export { searchPage, tagPage, musicPageProxy, sidebar, musicPage, albumPage };
