// Import locals
import date from 'gql/types/date';
import { diffContents } from 'lib/diff';
import { test_db_artist, test_new_artist } from 'lib/testData';

// Import methods and parsers
import * as bcMethods from 'spiders/bandcamp/methods';
import * as bcParsers from 'spiders/bandcamp/parsers';
import * as fbMethods from 'spiders/facebook/methods';
import * as fbParsers from 'spiders/facebook/parsers';
import * as instaMethods from 'spiders/instagram/methods';
import * as instaParsers from 'spiders/instagram/parsers';
import * as mbMethods from 'spiders/musicbrainz/methods';
import * as mbParsers from 'spiders/musicbrainz/parsers';
import * as skMethods from 'spiders/songkick/methods';
import * as skParsers from 'spiders/songkick/parsers';
import * as scMethods from 'spiders/soundcloud/methods';
import * as scParsers from 'spiders/soundcloud/parsers';
import * as spMethods from 'spiders/spotify/methods';
import * as spParsers from 'spiders/spotify/parsers';
import * as twMethods from 'spiders/twitter/methods';
import * as twParsers from 'spiders/twitter/parsers';
import * as ytMethods from 'spiders/youtube/methods';
import * as ytParsers from 'spiders/youtube/parsers';

// Mutation helpers
const createProto = (args, ctx) => {
  return ctx.create(args).then(result => {
    return result.serialize();
  });
};

const updateProto = (args, ctx) => {
  return ctx.update(args, { id: args.id }).then(result => {
    return result.serialize();
  });
};

const deleteProto = (args, ctx) => {
  return ctx.findById(args.id).then(result => {
    return ctx.destroy({ id: args.id }).then(() => {
      return result.serialize();
    });
  });
};

// Account queries
const Accounts = {
  Bandcamp: {
    search: (root, { keyword, type }) => {
      return bcMethods.search(keyword).then(response => {
        return bcParsers.searchPage(response, type);
      });
    }
  },
  Facebook: {
    search: (root, { keyword, type }, ctx) => {
      return fbMethods.getAccessToken(ctx.Session).then(access_token => {
        return fbMethods.search(keyword, type, access_token).then(response => {
          return fbParsers.searchResult(response);
        });
      });
    },
    get: (root, { id, type }, ctx) => {
      return fbMethods.getAccessToken(ctx.Session).then(access_token => {
        return fbMethods.getById(id, type, access_token).then(response => {
          return fbParsers.node(response, type);
        });
      });
    }
  },
  Instagram: {
    search: (root, { keyword }) => {
      return instaMethods.search(keyword).then(response => {
        return instaParsers.searchResult(response);
      });
    }
  },
  MusicBrainz: {
    search: (root, { keyword, type }) => {
      return mbMethods.search(keyword, type).then(response => {
        return mbParsers.searchResult[type](response);
      });
    },
    get: (root, { id, type }) => {
      return mbMethods.getById(id, type).then(response => {
        return mbParsers.node[type](response);
      });
    }
  },
  Songkick: {
    search: (root, { keyword, type }) => {
      return skMethods.search(keyword).then(response => {
        return skParsers.searchResult(response, type);
      });
    }
  },
  Soundcloud: {
    search: (root, { keyword, type }) => {
      return scMethods.search(keyword, type).then(response => {
        return scParsers.searchResult[type](response);
      });
    }
  },
  Spotify: {
    search: (root, { keyword, type }, ctx) => {
      return spMethods.getAccessToken(ctx.Session).then(access_token => {
        return spMethods.search(keyword, type, access_token).then(response => {
          return spParsers.searchResult[type](response);
        });
      });
    },
    get: (root, { uuid, type }, ctx) => {
      return spMethods.getAccessToken(ctx.Session).then(access_token => {
        return spMethods
          .getObjectById(uuid, type, access_token)
          .then(response => {
            return spParsers.objects[type](response);
          });
      });
    }
  },
  Twitter: {
    search: (root, { keyword }) => {
      return twMethods.search(keyword).then(response => {
        return twParsers.searchResult(response);
      });
    }
  },
  Youtube: {
    search: (root, { keyword, type }) => {
      return ytMethods.search(keyword, type).then(response => {
        return ytParsers.searchResult(response);
      });
    }
  }
};

// Database queries
const ArtistsPaged = (root, args, ctx) => {
  return ctx.Artist.findAllPaged(args).then(results => {
    return Object.assign(
      {},
      { pageInfo: results.pagination },
      { artists: results.serialize() }
    );
  });
};

const ArtistById = (
  root,
  {
    id,
    columns = '*',
    withRelated = [
      'accounts',
      'albums',
      { 'albums.tracks': qb => qb.orderBy('track_num') },
      'albums.accounts',
      'albums.tracks.accounts'
    ]
  },
  ctx
) => {
  return ctx.Artist
    .findById(id, { columns, withRelated, require: true })
    .then(result => result.serialize());
};

// Export GraphQl queries, mutations and custom scalar types
export default {
  Query: {
    ArtistsPaged,
    ArtistById,
    SearchAccounts: (root, { account, keyword, type }, ctx) => {
      return Accounts[account].search(root, { keyword, type }, ctx);
    },
    GetAccountContent: (root, { account, uuid, type }, ctx) => {
      return Accounts[account].get(root, { uuid, type }, ctx);
    },
    DiffContents: (root, { account, uuid, id, type }, ctx) => {
      /*return ArtistById(root, { id }, ctx).then(dbContent => {
        // Other getters? AlbumById, TrackById...
        return Accounts[account]
          .get(root, { uuid, type }, ctx)
          .then(newContent => {
            diffContents(dbContent, newContent[type.slice(0, -1)], type); // newContent.artist(s)
            return { artist: {} }; // new content - content type (added/edited..)
          });
      });*/
      diffContents(test_db_artist, test_new_artist);
      return { artist: {} };
    }
  },

  Mutation: {
    ArtistUpdate: (root, args, ctx) => updateProto(args, ctx.Artist),
    ArtistCreate: (root, args, ctx) => createProto(args, ctx.Artist),
    AlbumCreate: (root, args, ctx) => createProto(args, ctx.Album),
    AlbumUpdate: (root, args, ctx) => updateProto(args, ctx.Album),
    AlbumDelete: (root, args, ctx) => deleteProto(args, ctx.Album),
    AccountCreate: (root, args, ctx) => createProto(args, ctx.Account),
    AccountUpdate: (root, args, ctx) => updateProto(args, ctx.Account),
    AccountDelete: (root, args, ctx) => deleteProto(args, ctx.Account),
    TrackCreate: (root, args, ctx) => createProto(args, ctx.Track),
    TrackUpdate: (root, args, ctx) => updateProto(args, ctx.Track),
    TrackDelete: (root, args, ctx) => deleteProto(args, ctx.Track)
  },

  Date: date
};
