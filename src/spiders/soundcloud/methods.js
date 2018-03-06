/*global document:true*/

// Global modules
import Nightmare from 'nightmare';

// Local modules
import nightmare_config from 'config/nightmare';
import sc_config from './config';

/**
 * Searches Soundcloud for given artist or track name and outputs the result
 * @uses https://soundcloud.com/search/{type}?q={keyword}
 *
 * keyword:S, type:artists|albums|tracks
 *
 * Returns the result body, it's chainable
 */
const search = (keyword, type) => {
  // artists|albums|tracks -> people|sounds
  switch (type) {
    case 'artists':
      type = 'people';
      break;
    case 'albums' || 'tracks':
      type = 'sounds';
      break;
  }

  const nightmare = Nightmare(nightmare_config);
  const scSearchType = sc_config.search.queryType.replace('{type}', type);
  const scSearchUrl = `${sc_config.url}${sc_config.search.path}${scSearchType}${keyword}`;

  return nightmare
    .goto(scSearchUrl)
    .wait(sc_config.selectors.$searchWrapper)
    .evaluate(function() {
      return document.body.innerHTML;
    })
    .end();
};

/**
 * Retrieves Soundcloud user ID from the meta tags of user page
 * @uses https://soundcloud.com/{username}
 *
 * url:S
 *
 * Returns the ID
 */
const getId = url => {
  const nightmare = Nightmare(nightmare_config);
  const metaSelector = sc_config.selectors.$metaPropertyForId;

  return nightmare
    .goto(url)
    .wait('head')
    .evaluate(function(metaSelector) {
      return document
        .querySelector('meta[property="' + metaSelector + '"]')
        .getAttribute('content')
        .replace('soundcloud://users:', '');
    }, metaSelector)
    .end();
};

export { search, getId };
