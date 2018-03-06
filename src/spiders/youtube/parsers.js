// Local modules
import g_config from './config';

/**
 * Parses Youtube search:list
 * 
 * response: {items: [id: {kind:S, $kind$Id: S}]}
 * return: [{id:S, url:S, detail:S}]
 */
const searchResult = response => {
  var result = [];

  if (response && response.items && response.items.length > 0) {
    response.items.forEach(function(item) {
      if (item.id.videoId !== undefined) {
        result.push({
          id: item.id.videoId,
          name: item.snippet.title,
          url: g_config.youtube.videoUrl + item.id.videoId,
          image: item.snippet.thumbnails.default.url,
          detail: item.snippet.description
        });
      } else if (item.id.playlistId !== undefined) {
        result.push({
          id: item.id.playlistId,
          name: item.snippet.title,
          url: g_config.youtube.playlistUrl + item.id.playlistId,
          image: item.snippet.thumbnails.default.url,
          detail: item.snippet.description
        });
      } else if (item.id.channelId !== undefined) {
        result.push({
          id: item.id.channelId,
          name: item.snippet.title,
          url: g_config.youtube.channelUrl + item.id.channelId,
          image: item.snippet.thumbnails.default.url,
          detail: item.snippet.description
        });
      }
    });
  }

  return result;
};

export { searchResult };
