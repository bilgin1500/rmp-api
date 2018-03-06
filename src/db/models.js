// Import globals
import { bookshelf } from 'db/connector';
//import Promise from 'bluebird';

/**
 * Helper method function for paged fetchAll
 * Used on Artist, Album
 */
const findAllPaged = function(options) {
  let dbQuery = {};

  if (
    Object.hasOwnProperty.call(options.query, 'isSelected') &&
    Number.isInteger(options.query.isSelected)
  ) {
    dbQuery = { where: { is_selected: options.query.isSelected } };
  }

  return this.forge()
    .query(dbQuery)
    .orderBy(options.order, options.sort)
    .fetchPage({
      page: options.page,
      pageSize: options.pageSize,
      columns: options.columns,
      withRelated: options.withRelated
    });
};

/**
 * Helper method function for creating models with relations
 * Used on Album
 */
/*const createWithRelateds = function(data) {
  const thisModel = this;
  //console.log(data, relations);
  return bookshelf.transaction(function(t) {
    return thisModel.create(data, { transacting: t }).then(function(model) {
      //relations.forEach(relation => {
      //  console.log(thisModel.relations);
      //});
      //console.log(model.accounts());
      //return model.load(['accounts', 'tags', 'tracks']);
      return model;
    });
  });
};*/

// Models
const Account = bookshelf.Model.extend({
  tableName: 'accounts',
  ref: function() {
    return this.morphTo('ref', Album, Artist, Event, Track);
  }
});

const Album = bookshelf.Model.extend(
  {
    tableName: 'albums',
    accounts: function() {
      return this.morphMany(Account, 'ref');
    },
    artist: function() {
      return this.belongsTo(Artist);
    },
    media: function() {
      return this.morphMany(Medium, 'ref');
    },
    tags: function() {
      return this.hasMany(Tag);
    },
    tracks: function() {
      return this.hasMany(Track);
    }
  },
  {
    dependents: ['tracks', 'media', 'accounts'],
    findAllPaged
    //createWithRelateds
  }
);

const Artist = bookshelf.Model.extend(
  {
    tableName: 'artists',
    accounts: function() {
      return this.morphMany(Account, 'ref');
    },
    albums: function() {
      return this.hasMany(Album);
    },
    events: function() {
      return this.hasMany(Event);
    },
    media: function() {
      return this.morphMany(Medium, 'ref');
    },
    tags: function() {
      return this.hasMany(Tag);
    },
    tracks: function() {
      return this.hasMany(Track).through(Album);
    }
  },
  {
    dependents: ['accounts', 'albums', 'media'],
    findAllPaged
  }
);

const Event = bookshelf.Model.extend(
  {
    tableName: 'events',
    accounts: function() {
      return this.morphMany(Account, 'ref');
    },
    artists: function() {
      return this.belongsToMany(Artist);
    },
    places: function() {
      return this.belongsTo(Place);
    }
  },
  {
    dependents: ['accounts']
  }
);

const Medium = bookshelf.Model.extend({
  tableName: 'media',
  ref: function() {
    return this.morphTo('ref', Artist, Album, Track);
  }
});

const Place = bookshelf.Model.extend(
  {
    tableName: 'places',
    events: function() {
      return this.hasMany(Event);
    }
  },
  {
    dependents: ['events']
  }
);

const Tag = bookshelf.Model.extend({
  tableName: 'tags',
  albums: function() {
    return this.belongsToMany(Album);
  },
  artists: function() {
    return this.belongsToMany(Artist);
  }
});

const Track = bookshelf.Model.extend(
  {
    tableName: 'tracks',
    album: function() {
      return this.belongsTo(Album);
    },
    artist: function() {
      return this.belongsTo(Artist).through(Album);
    },
    media: function() {
      return this.morphMany(Medium, 'ref');
    },
    accounts: function() {
      return this.morphMany(Account, 'ref');
    }
  },
  {
    dependents: ['accounts', 'media']
  }
);

// Collections
const Albums = bookshelf.Collection.extend({ model: Album });
const Artists = bookshelf.Collection.extend({ model: Artist });
const Accounts = bookshelf.Collection.extend({ model: Account });
const Events = bookshelf.Collection.extend({ model: Event });
const Media = bookshelf.Collection.extend({ model: Medium });
const Places = bookshelf.Collection.extend({ model: Place });
const Tags = bookshelf.Collection.extend({ model: Tag });
const Tracks = bookshelf.Collection.extend({ model: Track });

export {
  Account,
  Accounts,
  Album,
  Albums,
  Artist,
  Artists,
  Event,
  Events,
  Medium,
  Media,
  Place,
  Places,
  Tag,
  Tags,
  Track,
  Tracks
};
