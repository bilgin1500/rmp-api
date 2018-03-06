export default {
  maxPagesToScrap: 10,
  url: 'https://bandcamp.com',
  tagPath: '/tag',
  albumsPath: '/music',
  searchPath: '/search?q={query}',
  tags: [
    'istanbul',
    'ankara',
    'turkey',
    'kadıköy',
    'izmir',
    'adana',
    'mersin',
    'eskişehir',
    'turkish rock',
    'turkish psychedelic',
    'turkish',
    'edirne',
    'izmit',
    'konya',
    'bursa'
  ],
  selectors: {
    searchPage: {
      $searchWrapper: '.result-items',
      $searchItem: '.searchresult',
      $searchItemTypeClass: {
        artists: 'band',
        albums: 'album',
        tracks: 'track'
      },
      $searchItemName: '.heading',
      $searchItemThumb: '.art img',
      $searchItemUrl: '.itemurl a',
      $searchItemGenre: '.genre',
      $searchItemReleases: '.releases',
      $searchItemTags: '.tags'
    },
    tagPage: {
      $albumWrapper: '.item',
      $artistName: '.itemsubtext',
      $albumName: '.itemtext'
    },
    sidebar: {
      $artistBio: '#bio-text',
      $artistLinks: '#band-links a',
      $artistPhoto: '.band-photo',
      $artistLocation: '#band-name-location .location'
    },
    musicPage: {
      $artistAlbumWrapper: '.music-grid',
      $allAlbumsData: 'data-initial-values',
      $labelMenu: '.label-band-selector-grid'
    },
    albumPage: {
      $albumCover: '#tralbumArt .popupImage',
      $albumTags: '.tralbum-tags a'
    }
  }
};
