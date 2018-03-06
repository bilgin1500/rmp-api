// Global modules
import Twitter from 'twitter';

// Local modules
import twitter_config from './config';

const twitter = new Twitter({
  consumer_key: twitter_config.consumerKey,
  consumer_secret: twitter_config.consumerSecret,
  access_token_key: twitter_config.accessTokenKey,
  access_token_secret: twitter_config.accessTokenSecret
});

/**
 * Search Twitter Rest API for users or tweets
 * @see https://dev.twitter.com/rest/reference/get/users/search
 * @see https://dev.twitter.com/rest/reference/get/search/tweets
 * @uses https://github.com/desmondmorris/node-twitter
 *
 * keyword:S
 *
 * Returns the request promise, it's chainable
 */
const search = keyword => {
  return twitter.get(twitter_config.endPoints.searchUsers, { q: keyword });
};

export { search };
