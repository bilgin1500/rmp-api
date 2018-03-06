// Global modules
import cheerio from 'cheerio';
import Promise from 'bluebird';

// Local modules
import sc_config from './config';
import { getId } from './methods';

/**
   * Parses Soundcloud people search results
   * 
   * response: https://soundcloud.com/search/people?q= result's raw HTML
   * return: Array [{id:S, name:S, url:S, detail:S, image:S}]
   */
const searchResultPeople = response => {
  let result = [];
  let permalinks = [];

  const $ = cheerio.load(response);
  const $searchItems = $(sc_config.selectors.$searchItem);
  let $userImage,
    $userTitle,
    $userDetails,
    userTitle,
    userLink,
    userImageUrl,
    userDetails;

  if ($searchItems.length > 0) {
    $searchItems.slice(0, 10).each((index, searchItem) => {
      $userTitle = $(searchItem).find(sc_config.selectors.people.$userTitle);
      $userImage = $(searchItem).find(sc_config.selectors.people.$userImage);
      $userDetails = $(searchItem).find(
        sc_config.selectors.people.$userDetails
      );

      userTitle = $userTitle.text().trim();
      userLink = $userTitle.attr('href');
      userDetails = $userDetails.text().trim().replace('\n    \n    ', ', ');
      userImageUrl = $userImage.css('background-image');
      if (userImageUrl) {
        userImageUrl = userImageUrl.replace('url("', '').replace('")', '');
      }

      permalinks.push(getId(sc_config.url + userLink).then(userId => userId));

      result.push({
        name: userTitle,
        url: sc_config.url + userLink,
        detail: userDetails,
        image: userImageUrl
      });
    });
  }

  return Promise.all(permalinks).then(allIDs => {
    return result.map((item, index) => {
      return { id: allIDs[index], ...item };
    });
  });
};

/**
 * Parses Soundcloud sounds search results
 * 
 * response: https://soundcloud.com/search/sounds?q= result's raw HTML
 * return: Array [{id:S, name:S, url:S, detail:S, image:S}]
 */
const searchResultSounds = response => {
  let result = [];

  const $ = cheerio.load(response);
  const $searchItems = $(sc_config.selectors.$searchItem).slice(0, 10);
  let $userTitle, userTitle, userLink, $soundTitle, soundTitle, soundLink;
  /*$soundImage,
      soundImageUrl*/

  if ($searchItems.length > 0) {
    $searchItems.forEach(searchItem => {
      $userTitle = $(searchItem).find(sc_config.selectors.sounds.$userTitle);
      $soundTitle = $(searchItem).find(sc_config.selectors.sounds.$soundTitle);
      /*$soundImage = $(searchItem).find(
          sc_config.selectors.sounds.$soundImage
        );*/

      userTitle = $userTitle.text().trim();
      userLink = $userTitle.attr('href');
      soundTitle = $soundTitle.text().trim();
      soundLink = $soundTitle.attr('href');
      /*soundImageUrl = $soundImage
          .css('background-image')
          .replace('url("', '')
          .replace('")', '');*/

      result.push({
        name: soundTitle,
        url: sc_config.url + soundLink,
        detail: 'Artist name: ' +
          userTitle +
          '<br/>Artist url: ' +
          sc_config.url +
          userLink
        /*image: soundImageUrl*/
      });
    });
  }

  return result;
};

/**
 * Parses Soundcloud search results
 */
const searchResult = {
  artists: searchResultPeople,
  albums: searchResultSounds,
  tracks: searchResultSounds
};

export { searchResult };
