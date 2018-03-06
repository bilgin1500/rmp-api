export default {
  url: 'http://www.songkick.com',
  searchPath: '/search?query={query}',
  artistPath: '/artists/{artistId}-{artistName}',
  selectors: {
    $searchWrapper: '.component.search ul',
    $searchItem: '.component.search ul li',
    $searchItemTypeClass: {
      artists: 'artist',
      events: 'event',
      places: 'venue'
    },
    $searchItemName: '.summary a',
    $searchItemThumb: '.thumb img',
    $searchItemDate: '.date time',
    $searchItemLocation: '.location',
    $searchItemTag: '.item-state-tag'
  }
};
