const accountName = 'Spotify';
/**
 * Parses Spotify's search results
 */
const searchResult = {
  /**
   * Parses Spotify search results for 'artist'
   * 
   * response: {artists: { items: [{ external_urls:{}, followers:{}, genres:[], id:S, images:[], name:S, type:S, uri:S, popularity:N }] ,href:S, limit:N... }
   * return: Array [artist:{id:S, name:S, url:S, image:S}]
   */
  artists: response => {
    let result = [];

    if (
      typeof response === 'object' &&
      response.artists &&
      response.artists.items &&
      response.artists.items.length > 0
    ) {
      response.artists.items.forEach(artist => {
        result.push({
          id: artist.id,
          name: artist.name,
          url: artist.href,
          image: artist.images[0].url
        });
      });
    }

    return result;
  },

  /**
   * Parses Spotify search results for 'album'
   * 
   * response: {albums: { items: [{ album: {}, artists: [], available_markets:[], disc_number:N, duration_ms:N, href:S, id:S, name:S, track_number:N, preview_url:S }] ,href:S, limit:N... }
   * return: Array [album:{id:S, name:S, url:S, image:S}, artist:{id:S, name:S, url:S} ]
   */
  albums: response => {
    let result = [];

    if (
      typeof response === 'object' &&
      response.albums &&
      response.albums.items &&
      response.albums.items.length > 0
    ) {
      response.albums.items.forEach(album => {
        result.push({
          id: album.id,
          name: album.name,
          url: album.href,
          image: album.images[0].url,
          detail: '<strong>Artist:</strong> ' + album.artists[0].name
        });
      });
    }

    return result;
  },

  /**
   * Parses Spotify search results for 'track'
   * 
   * response: {tracks: { items: [{ album: {}, artists: [], available_markets:[], disc_number:N, duration_ms:N, href:S, id:S, name:S, track_number:N, preview_url:S }] ,href:S, limit:N... }
   * return: Array [track:{id:S, name:S, url:S}, album:{id:S, name:S, url:S, image:S}, artist:{id:S, name:S, url:S} ]
   */
  tracks: response => {
    let result = [];

    if (
      typeof response === 'object' &&
      response.tracks &&
      response.tracks.items &&
      response.tracks.items.length > 0
    ) {
      response.tracks.items.forEach(track => {
        result.push({
          id: track.id,
          name: track.name,
          url: track.href,
          detail:
            '<strong>Album:</strong> ' +
            track.album.name +
            '<br/><strong>Artist:</strong> ' +
            track.artists[0].name
        });
      });
    }

    return result;
  }
};

// Spotify release date converter
const buildReleaseDate = (release_date, release_date_precision) => {
  switch (release_date_precision) {
    case 'year':
      return release_date + '-00-00';
    case 'month':
      return release_date + '-00';
    case 'day':
      return release_date;
  }
};

/**
 * Parses Spotify's objects
 */
const objects = {
  /**
   * Parses Spotify's artist object (full)
   * @see https://developer.spotify.com/web-api/object-model/#artist-object-full
   * 
   * return: {name:S, tags:[], accounts:[]}
   */
  artists: response => {
    let result = {};

    const parseAlbum = objects.albums;

    if (typeof response === 'object') {
      result = {
        artist: {
          name: response.name,
          tags: response.genres.map(genre => {
            return { name: genre };
          }),
          accounts: [
            {
              name: accountName,
              uuid: response.id,
              ref_type: 'artists'
            }
          ],
          albums: response.albums.map(album => parseAlbum(album).album)
        }
      };
    }
    return result;
  },

  /**
   * Parses Spotify's album object (full)
   * @see https://developer.spotify.com/web-api/object-model/#album-object-full
   * 
   * return: {name:S, release_date:D, medium:[], accounts:[], tags:[], tracks:[]}
   */
  albums: response => {
    let result = {};
    let tracks = [];
    let genres = [];
    let medium = [];

    const parseTrack = objects.tracks;

    if (response.tracks && response.tracks.items.length > 0) {
      tracks = response.tracks.items.map(track => {
        return parseTrack(track).track;
      });
    }

    if (response.genres && response.genres.length > 0) {
      genres = response.genres.map(genre => {
        return { name: genre };
      });
    }

    if (response.copyright) {
      response.copyright.forEach(copyright => {
        medium.push({
          type: 'text',
          category: 'copyright',
          text: copyright.text,
          ref_type: 'albums'
        });
      });
    }

    if (response.label) {
      medium.push({
        type: 'text',
        category: 'label',
        text: response.label,
        ref_type: 'albums'
      });
    }

    if (response.images && response.images.length > 0) {
      medium.push({
        type: 'image',
        category: 'album_cover',
        url: response.images[0].url,
        ref_type: 'albums'
      });
    }

    if (typeof response === 'object') {
      result = {
        album: {
          name: response.name,
          release_date: buildReleaseDate(
            response.release_date,
            response.release_date_precision
          ),
          accounts: [
            {
              name: accountName,
              uuid: response.id,
              ref_type: 'albums'
            }
          ],
          medium: medium,
          tags: genres,
          tracks: tracks
        }
      };
    }

    return result;
  },

  /**
   * Parses Spotify's single track (simplified)
   * @see https://developer.spotify.com/web-api/object-model/#track-object-simplified
   * 
   * return: {name:S, disc_num:N, track_num:N, accounts:[], medium:[]}
   */
  tracks: response => {
    let result = {};
    let medium = [];

    if (typeof response === 'object') {
      if (response.preview_url && response.preview_url !== null) {
        medium.push({
          url: response.preview_url,
          type: 'audio',
          category: 'track',
          duration: response.duration_ms,
          ref_type: 'tracks'
        });
      }

      result = {
        track: {
          name: response.name,
          disc_num: response.disc_number,
          track_num: response.track_number,
          accounts: [
            {
              name: accountName,
              uuid: response.id,
              ref_type: 'tracks'
            }
          ],
          medium: medium
        }
      };
    }
    return result;
  }
};

export { searchResult, objects };
