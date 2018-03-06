export default {
  url: 'https://soundcloud.com',
  search: {
    path: '/search/',
    queryType: '{type}?q='
  },
  selectors: {
    $metaPropertyForId: 'twitter:app:url:iphone',
    $searchWrapper: '.lazyLoadingList__list',
    $searchItem: '.searchItem',
    people: {
      $userImage: '.userItem__coverArt span',
      $userTitle: '.userItem__title > a',
      $userDetails: '.userItem__details'
    },
    sounds: {
      $userTitle: '.soundTitle__username',
      $soundImage: '.sound__coverArt .image span',
      $soundTitle: '.soundTitle__title'
    }
  }
};
