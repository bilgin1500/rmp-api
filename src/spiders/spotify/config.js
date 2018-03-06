export default {
  clientId: 'dda596e92bd043ad8b6e7b70347e2fa3',
  clientSecret: '22d0ef0514744f979ebb81df62d5f73f',
  apiToken: 'https://accounts.spotify.com/api/token',
  apiUrl: 'https://api.spotify.com/v1/',
  market: 'market=tr',
  albumTypes: 'album_type=album,single,ep',
  search: {
    endpoint: 'search?q=',
    queryType: '&type={type}',
    limit: '&offset=0&limit=5'
  },
  artists: { endpoint: 'artists/' },
  albums: { endpoint: 'albums/' },
  tracks: { endpoint: 'tracks/' }
};
