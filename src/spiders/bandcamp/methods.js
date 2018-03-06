/*global document:true*/

// Global modules
import Nightmare from 'nightmare';

// Local modules
import nightmare_config from 'config/nightmare';
import bc_config from './config';

/**
 * Searches Bandcamp for given artist, album or track and outputs the result
 * @uses https://bandcamp.com/search?q={keyword}
 *
 * keyword:S
 *
 * Returns the result body, it's chainable
 */
const search = keyword => {
  const nightmare = Nightmare(nightmare_config);
  const bcSearchUrl = `${bc_config.url}${bc_config.searchPath.replace('{query}', keyword)}`;

  return nightmare
    .goto(bcSearchUrl)
    .wait(bc_config.selectors.searchPage.$searchWrapper)
    .evaluate(() => {
      return document.body.innerHTML;
    })
    .end();
};

export { search };
