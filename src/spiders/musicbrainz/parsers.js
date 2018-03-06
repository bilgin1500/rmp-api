// Local modules
import mb_config from './config';

/**
 * Parses Musicbrainz search results
 */
const searchResult = {
  /**
   * Parses Musicbrainz search results for artists
   * 
   * response Array [{id:S, type:Group|Band etc.. tags:[{count:N, name:S}]}]
   * return Array [{id:S, name:S}]
   */
  artists: response => {
    let result = [];

    if (response.artists && response.artists.length > 0) {
      response.artists.forEach(function(artist) {
        result.push({
          id: artist.id,
          name: artist.name,
          url: mb_config.url + '/artist/' + artist.id
        });
      });
    }

    return result;
  }
};

/**
 * Parses Musicbrainz single node result
 */
const node = {
  /**
   * Parses Musicbrainz detail page for artist
   * 
   * response {type:Group|Band etc.., relations: [type:S, url:{resource:S}]}
   * return {name:S, urls: [{type:S, href:S}]}
   */
  artists: response => {
    let result = {
      name: response.name,
      accounts: [
        {
          name: 'musicbrainz',
          url: response.id,
          ref_type: 'artists'
        }
      ]
    };

    if (response.relations && response.relations.length > 0) {
      response.relations.forEach(function(relation) {
        let urlType = relation.type;
        const urlResource = relation.url.resource;
        const domain = urlResource.split('/')[2];

        // Sanitize the url types
        if (!mb_config.excludedUrls.includes(urlType.toLowerCase())) {
          if (urlType === 'social network' && domain.includes('twitter')) {
            urlType = 'twitter';
          }
          if (urlType === 'social network' && domain.includes('facebook')) {
            urlType = 'facebook';
          }
          if (urlType === 'social network' && domain.includes('instagram')) {
            urlType = 'instagram';
          }
          if (urlType === 'streaming music' && domain.includes('spotify')) {
            urlType = 'spotify';
          }
          if (urlType === 'video channel' && domain.includes('vimeo')) {
            urlType = 'vimeo';
          }

          result.accounts.push({
            name: urlType,
            url: urlResource,
            ref_type: 'artists'
          });
        }
      });
    }

    return result;
  }
};

export { searchResult, node };
