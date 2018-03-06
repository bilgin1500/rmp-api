// Import globals
import Knex from 'knex';
import Bookshelf from 'bookshelf';
import knexfile from 'config/knexfile';

// Init SQL builder and ORM
const knex = Knex(knexfile.development);
const bookshelf = Bookshelf(knex);

// Plugins for Bookshelf
bookshelf.plugin(require('bookshelf-cascade-delete'));
bookshelf.plugin(require('bookshelf-modelbase').pluggable);
bookshelf.plugin(require('bookshelf-page'));

export { knex, bookshelf };
