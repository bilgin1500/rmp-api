// Global modules
import FB from 'fb';
import Promise from 'bluebird';

// Local modules
import fb_config from './config';

/**
 * @uses https://github.com/node-facebook/facebook-node-sdk#get-facebook-application-access-token
 * @see https://developers.facebook.com/tools/accesstoken/
 * 
 * Returns a promise with token value, it's chainable
 */
const getAccessToken = session => {
  if (session.facebookAccessToken) {
    return Promise.resolve(session.facebookAccessToken.access_token);
  } else {
    return FB.api('oauth/access_token', {
      client_id: fb_config.appId,
      client_secret: fb_config.appSecret,
      grant_type: 'client_credentials'
    }).then(response => {
      if (!response || response.error) {
        throw new Error(response.error);
      }
      session.facebookAccessToken = response;
      return response.access_token;
    });
  }
};

/**
 * Search Facebook database for pages and returns first 25 results
 * @see https://developers.facebook.com/docs/graph-api/using-graph-api#search
 * @uses GET https://github.com/node-facebook/facebook-node-sdk#get
 * @graphapi
 * https://developers.facebook.com/tools/explorer/1551214395182968?method=GET&path=search%2F%3Fq%3Dtest%26type%3Dpage%26fields%3Did%2Cname%2Cabout%2Ccategory%2Cdescription%2Cfan_count%2Cpicture%7Burl%7D&version=v2.9
 *
 * keyword:S, type:artists
 *
 * Returns the request promise, it's chainable
 */
const search = (keyword, type, accessToken) => {
  // artists - > user|page|event|group|place|placetopic|ad_* (access_token is only valid for 'page')
  switch (type) {
    case 'artists':
      type = 'page';
      break;
  }

  return FB.api('search', {
    q: keyword,
    type: type,
    fields: fb_config.fields_basic.join() + ',' + fb_config.fields_page.join(),
    access_token: accessToken
  }).then(response => {
    if (!response || response.error) {
      throw new Error(response.error);
    }
    return response;
  });
};

/**
 * Get requested fields of a Facebook node
 * @see https://developers.facebook.com/docs/graph-api/reference/page
 * @uses GET https://github.com/node-facebook/facebook-node-sdk#get graphapi
 * @graphapi
 * https://developers.facebook.com/tools/explorer/1551214395182968?method=GET&path=1542993376020746%3Ffields%3Did%2Cname%2Cabout%2Ccategory%2Cdescription%2Cfan_count%2Cpicture%7Burl%7D%2Cevents%7Bname%2Cplace%2Cstart_time%2Cticket_uri%2Cdescription%2Cend_time%2Cid%7D&version=v2.9
 *
 * fbId:S, type:artists
 *
 * Returns the request promise, it's chainable
 */
const getById = (fbId, type, fbAccessToken) => {
  let finalFields = fb_config.fields_basic.join();

  switch (type) {
    case 'artists':
      finalFields += ',' + fb_config.fields_page.join();
      // events
      //finalFields += `,events{${fb_config.fields_events.join()}}`;
      // photos
      //finalFields += `,photos{${fb_config.fields_photos.join()}}`;
      // place
      //finalFields += ',' + fb_config.fields_place.join();
      break;
  }

  return FB.api(fbId, {
    fields: finalFields,
    access_token: fbAccessToken
  }).then(response => {
    if (!response || response.error) {
      throw new Error(response.error);
    }
    return response;
  });
};

export { getAccessToken, search, getById };
