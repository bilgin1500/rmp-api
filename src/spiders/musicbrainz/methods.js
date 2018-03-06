// Global modules
import request from 'requestretry';

// Local modules
import mb_config from './config';

/**
 * MusicBrainz API requester
 * Returns the request promise, it's chainable
 */
const _request = url => {
  return request({
    url: url,
    headers: { 'User-Agent': mb_config.userAgent },
    json: true,
    fullResponse: false,
    delayStrategy: function() {
      return Math.floor(Math.random() * (3500 - 500 + 1) + 1500);
    }
  }).then(function(response) {
    if (response.error || response === 'Internal Server Error') {
      throw new Error('Error happened in ', response.request.href);
    }

    return response;
  });
};

/**
 * MusicBrainz search
 * @see https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2/Search
 * @uses GET http://musicbrainz.org/ws/2/{endpoint}/?query={endpoint}:{keyword}%20AND%20country:tr&fmt=json
 *
 * keyword:S, type:artists|albums|tracks
 *
 * Returns the request promise, it's chainable
 */
const search = (keyword, type) => {
  // artists|albums|tracks -> area|artist|label|place|recording|release|tag
  switch (type) {
    case 'artists':
      type = 'artist';
      break;
  }
  let url =
    mb_config.url +
    mb_config.apiPath +
    mb_config.endpoint.replace('{endpoint}', type) +
    mb_config.querySearch
      .replace('{endpoint}', type)
      .replace('{name}', encodeURIComponent(keyword));
  url = url + mb_config.apiResType;

  return _request(url);
};

/**
 * MusicBrainz get artist details with all related urls
 * @see https://musicbrainz.org/doc/{type}
 * @uses GET ttp://musicbrainz.org/ws/2/{type}/{id}?inc={inc}&fmt=json
 *
 * id:S, type:artists|albums|tracks, inc:url-rels etc.
 *
 * Returns the request promise, it's chainable
 */
const getById = (id, type, inc = 'url-rels') => {
  // artists|albums|tracks -> area|artist|label|place|recording|release|tag
  switch (type) {
    case 'artists':
      type = 'artist';
      break;
  }

  let url =
    mb_config.url +
    mb_config.apiPath +
    mb_config.endpoint.replace('{endpoint}', type) +
    id;

  if (inc) {
    url = url + mb_config.includes.replace('{inc}', inc);
  }

  url = url + mb_config.apiResType;

  return _request(url);
};

export { search, getById };
