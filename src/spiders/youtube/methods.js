// Global modules
import google from 'googleapis';
import Promise from 'bluebird';

// Local modules
import g_config from './config';

/**
 * Initiliaze Youtube API
 * 
 * For quota calculation:
 * https://developers.google.com/youtube/v3/determine_quota_cost
 * Total of 10000 (per search.list.snippet costs 100)
 *
 * For Google API Node.js Client: 
 * https://github.com/google/google-api-nodejs-client/
 * https://github.com/google/google-api-nodejs-client/blob/master/samples/youtube/search.js
 */
const youtube = google.youtube({
  version: 'v3',
  auth: g_config.APIkey
});

// Use the promised version of google.youtube.search.list
const youtubeSearchList = Promise.promisify(youtube.search.list, {
  context: youtube
});

/**
 * Youtube search:list
 * @see https://developers.google.com/youtube/v3/docs/search/list
 * @uses GET https://www.googleapis.com/youtube/v3/search
 *
 * keyword:S, type:artists|albums|tracks
 *
 * Returns the search list promise, it's chainable
 */
const search = (keyword, type) => {
  // artists|albums|tracks -> video|playlist|channel
  switch (type) {
    case 'artists':
      type = 'channel';
      break;
  }

  return youtubeSearchList({
    part: 'snippet',
    type: type,
    q: keyword,
    maxResults: 10
  }).then(function(response) {
    return response;
  });
};

export { search };
