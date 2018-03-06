/*global document:true*/

// Global modules
import Nightmare from 'nightmare';

// Local modules
import nightmare_config from 'config/nightmare';
import sk_config from './config';

/**
 * Searches Songkick for given artist, concert or venue and outputs the result
 * @uses https://songkick.com/search?query={keyword}
 *
 * keyword:S
 *
 * Returns the result body, it's chainable
 */
const search = keyword => {
  const nightmare = Nightmare(nightmare_config);
  const scSearchUrl = `${sk_config.url}${sk_config.searchPath.replace('{query}', keyword)}`;

  return nightmare
    .goto(scSearchUrl)
    .wait(sk_config.selectors.$searchWrapper)
    .evaluate(function() {
      return document.body.innerHTML;
    })
    .end();
};

export { search };
