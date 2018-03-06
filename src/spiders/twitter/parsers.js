// Local modules
import twitter_config from './config';

/**
 * Parses Twitter Rest API search result for users or tweets
 * 
 * responses: https://dev.twitter.com/rest/reference/get/users/search#example-response
 * return: Array [ {id:S, name:S, url:S, image:S, detail:S}]
 */
const searchResult = response => {
  return response.map(item => {
    let detail = '';

    if (item.location) {
      detail += '<strong>Location:</strong> ' + item.location + '<br/>';
    }

    if (item.description) {
      detail += '<strong>Description:</strong> ' + item.description + '<br/>';
    }

    if (item.followers_count) {
      detail += '<strong>Followers:</strong> ' + item.followers_count + '<br/>';
    }

    if (item.verified) {
      detail += '<strong>Verified:</strong> ' + item.verified;
    }

    return {
      id: item.id,
      name: item.name + ' (' + item.screen_name + ')',
      url: twitter_config.url + '/' + item.screen_name,
      image: item.profile_image_url,
      detail: detail
    };
  });
};

export { searchResult };
