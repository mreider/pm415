const Config = require('./config');

const knex = require('knex')({
  client: 'mysql',
  connection: Config.db.databaseUri
});

const bookshelf = require('bookshelf')(knex);
bookshelf.plugin(['virtuals', 'registry', 'bookshelf-camelcase']);

const modelBase = require('bookshelf-modelbase')(bookshelf);

module.exports = {
  bookshelf,
  modelBase,
  knex
};
