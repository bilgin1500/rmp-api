// Global modules
import cheerio from 'cheerio';

// Local modules
import sk_config from './config';

/**
 * Parses Songkick search results and filter result items by their types
 * 
 * response: http://www.songkick.com/search?query= result's raw HTML, type: artists|events|places
 * return: Array [{id:S, name:S, url:S, detail:S, image:S}]
 */
const searchResult = (response, type) => {
  let result = [];

  const $ = cheerio.load(response);
  const $searchItems = $(sk_config.selectors.$searchItem);

  if ($searchItems.length > 0) {
    $searchItems.each((index, searchItem) => {
      const $searchItem = $(searchItem);

      if (
        $searchItem.hasClass(sk_config.selectors.$searchItemTypeClass[type])
      ) {
        let name = $searchItem.find(sk_config.selectors.$searchItemName).text();
        let url = $searchItem
          .find(sk_config.selectors.$searchItemName)
          .attr('href');
        let image = $searchItem
          .find(sk_config.selectors.$searchItemThumb)
          .attr('src');
        let id = url.split('/')[2].split('-')[0];

        let detail = '';

        let date = $searchItem
          .find(sk_config.selectors.$searchItemDate)
          .text()
          .trim()
          .replace(/\s+/g, ' ');
        let loc = $searchItem
          .find(sk_config.selectors.$searchItemLocation)
          .text()
          .trim()
          .replace(/\s+/g, ' ');
        let tag = $searchItem
          .find(sk_config.selectors.$searchItemTag)
          .text()
          .replace(/\s+/g, ' ');

        if (date) {
          detail += '<strong>Date:</strong> ' + date + '<br/>';
        }

        if (loc) {
          detail += '<strong>Location:</strong> ' + loc + '<br/>';
        }

        if (tag) {
          detail += '<strong>Tag:</strong> ' + tag + '<br/>';
        }

        result.push({
          id: id,
          name: name,
          url: sk_config.url + url,
          detail: detail,
          image: image
        });
      }
    });
  }

  return result;
};

export { searchResult };
