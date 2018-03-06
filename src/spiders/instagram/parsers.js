// Global modules
import cheerio from 'cheerio';
import request from 'requestretry';

// Local modules
import insta_config from './config';

/**
 * Parses Instagram API search result for users
 * 
 * response: https://instagram.com AJAX search result's raw HTML
 * return: Array [ {id:S, name:S, url:S, image:S, detail:S}]
 */
const searchResult = response => {
  let permalinks = [];
  const $ = cheerio.load(response);
  const $searchItems = $(insta_config.selectors.$searchItems);

  if ($searchItems.length > 0) {
    $searchItems.each((index, searchItem) => {
      const $searchItem = $(searchItem);

      if (!$searchItem.hasClass(insta_config.selectors.$searchItemTagClass)) {
        const username = $searchItem
          .find(insta_config.selectors.$searchItemUsername)
          .text()
          .trim();

        permalinks.push(
          request({
            url:
              insta_config.url +
              insta_config.userDataPath.replace('{username}', username),
            json: true,
            fullResponse: false
          }).then(response => {
            if (response.user) {
              return {
                id: response.user.id,
                name:
                  response.user.full_name + ' (' + response.user.username + ')',
                url: insta_config.url + '/' + response.user.username,
                image: response.user.profile_pic_url_hd,
                detail:
                  '<strong>Biography:</strong> ' +
                  response.user.biography +
                  '</br>' +
                  '<strong>Followed by:</strong> ' +
                  response.user.followed_by.count +
                  '</br>' +
                  '<strong>Follows:</strong> ' +
                  response.user.follows.count +
                  '</br>' +
                  '<strong>Media count:</strong> ' +
                  response.user.media.count +
                  '</br>' +
                  '<strong>Verified:</strong> ' +
                  response.user.is_verified +
                  '</br>' +
                  '<strong>Private:</strong> ' +
                  response.user.is_private +
                  '</br>'
              };
            }
          })
        );
      }
    });
  }

  return Promise.all(permalinks).then(response => {
    return response.filter(n => n);
  });
};

export { searchResult };
