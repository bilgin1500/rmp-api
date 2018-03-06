/**
 * Parses Facebook's Graph API search result
 * 
 * response: Object {data: [{name:S, id:S}], paging: {cursors:Object}, next: Url}
 * return: Array [ {id:S, name:S, url:S, image:S, detail:S}]
 */
const searchResult = response => {
  const result = response.data.map(item => {
    let detail = '';

    if (item.fan_count) {
      detail += '<strong>Fan count:</strong> ' + item.fan_count + '<br/>';
    }

    if (item.about) {
      detail += '<strong>About:</strong> ' + item.about + '<br/>';
    }

    if (item.description) {
      detail += '<strong>Description:</strong> ' + item.description;
    }

    return {
      id: item.id,
      name: item.name,
      url: item.link,
      image: item.picture.data.url,
      detail: detail
    };
  });
  return result;
};

/**
 * Parses Facebook's node
 */
const node = (response, type) => {
  console.log(type);

  if (response.picture) {
    response.profile_picture = response.picture.data.url;
    delete response.picture;
  }

  if (response.events) {
    response.events = response.events.data.map(function(event) {
      if (event.ticket_uri) {
        event.ticket_url = event.ticket_uri;
        delete event.ticket_uri;
      }
      if (event.place) {
        event.place = Object.assign(event.place, event.place.location);
        delete event.place.location;
      }
      return event;
    });
  }

  return response;
};

export { searchResult, node };
