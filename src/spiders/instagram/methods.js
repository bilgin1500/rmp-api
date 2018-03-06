/*global document:true*/

// Global modules
import Nightmare from 'nightmare';

// Local modules
import nightmare_config from 'config/nightmare';
import insta_config from './config';

/**
 * Searches Instagram for given user and outputs the result
 * @uses Instagram ajax search input
 *
 * keyword:S
 *
 * Returns the search results, it's chainable
 */
const search = keyword => {
  const nightmare = Nightmare(nightmare_config);

  return nightmare
    .goto('https://www.instagram.com/rolakostadesign/')
    .wait(insta_config.selectors.$inputSearch)
    .type(insta_config.selectors.$inputSearch, keyword)
    .wait(insta_config.selectors.$searchResults)
    .evaluate(() => {
      return document.body.innerHTML;
    })
    .end();
};

export { search };
