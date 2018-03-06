// Global modules
import request from 'requestretry';
import moment from 'moment';

// Local modules
import sp_config from './config';

/**
 * Client Credentials Flow: Get new Spotify access token
 * https://developer.spotify.com/web-api/authorization-guide/#client_credentials_flow
 * The method makes it possible to authenticate your requests to the Spotify
 * Web API and to obtain a higher rate limit than you would get without
 * authentication. 
 *
 * Returns a promise with token value, it's chainable
 */
const getAccessToken = session => {
  if (
    session.spotifyAccessToken &&
    moment(session.spotifyAccessToken.expires).diff(moment(), 'm') > 5
  ) {
    return Promise.resolve(session.spotifyAccessToken.access_token);
  } else {
    return request({
      maxAttempts: 20,
      retryDelay: 10000,
      url: sp_config.apiToken,
      headers: {
        Authorization:
          'Basic ' +
          new Buffer(
            sp_config.clientId + ':' + sp_config.clientSecret
          ).toString('base64')
      },
      form: { grant_type: 'client_credentials' },
      method: 'POST',
      json: true,
      fullResponse: false,
      delayStrategy: () => {
        return Math.floor(Math.random() * (3500 - 500 + 1) + 1500);
      }
    }).then(response => {
      if (!response || response.error) {
        throw new Error(JSON.stringify(response.error));
      }
      session.spotifyAccessToken = response;
      session.spotifyAccessToken.expires = moment().add(
        response.expires_in,
        's'
      );
      return response.access_token;
    });
  }
};

// Build the request header for GET requests
const reqHeader = (url, accessToken) => {
  return {
    url: url,
    headers: { Authorization: 'Bearer ' + accessToken },
    json: true,
    fullResponse: false
  };
};

/**
 * Search Spotify database for album, artist, playlist, or track and return the 5 results
 * @see https://developer.spotify.com/web-api/search-item/
 * @uses GET https://api.spotify.com/v1/search
 *
 * keyword:S, type:artists|albums|tracks
 *
 * Returns the request promise, it's chainable
 */
const search = (keyword, type, accessToken) => {
  // artists|albums|tracks -> artist|album|track
  switch (type) {
    case 'artists':
      type = 'artist';
      break;
    case 'albums':
      type = 'album';
      break;
    case 'tracks':
      type = 'track';
      break;
  }

  let url;
  url = sp_config.apiUrl + sp_config.search.endpoint;
  url =
    url +
    encodeURIComponent(keyword) +
    sp_config.search.queryType.replace('{type}', type);
  url = url + sp_config.search.limit;

  return request(reqHeader(url, accessToken)).then(response => {
    if (!response || response.error) {
      throw new Error(JSON.stringify(response.error));
    }
    return response;
  });
};

/**
 * Get Spotify object (artist, album, track etc.) details by ID
 * If object type is 'artists' function also returns albums and tracks 
 * @see https://developer.spotify.com/web-api/get-{type}/
 * @uses GET https://api.spotify.com/v1/{type}/{id}/{subType}
 *
 * uuid:Spotify ID, type: artists|albums|tracks
 *
 * Returns the request promise, it's chainable
 */
const getObjectById = (uuid, type, accessToken) => {
  let url = sp_config.apiUrl + sp_config[type].endpoint + uuid;

  const handleError = response => {
    if (!response || response.error) {
      throw new Error(JSON.stringify(response.error));
    }
  };

  const object = request(reqHeader(url, accessToken)).then(response => {
    handleError(response);
    return response;
  });

  // First get album ids with {api}/artists/{id}/albums
  // Then get full album objects with {api}/albums
  if (type === 'artists') {
    const getArtistsAlbumsUrl = `${url}/${sp_config.albums
      .endpoint}?${sp_config.market}&${sp_config.albumTypes}`;

    return request(
      reqHeader(getArtistsAlbumsUrl, accessToken)
    ).then(response => {
      handleError(response);
      const allAlbumIds = response.items.map(album => album.id).join();
      const getSeveralAlbumsUrl = `${sp_config.apiUrl}${sp_config.albums
        .endpoint}?ids=${allAlbumIds}`;
      return request(
        reqHeader(getSeveralAlbumsUrl, accessToken)
      ).then(severalAlbumData => {
        handleError(severalAlbumData);
        return object.then(response => {
          return Object.assign(response, severalAlbumData);
        });
      });
    });
  }

  return object;
};

export { getAccessToken, search, getObjectById };
