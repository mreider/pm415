const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const Roles = ModelBase.extend({
  tableName: 'roles'

  // Association

  // Instance methods

}, {
  // Static methods
});

module.exports = Bookshelf.model('Roles', Roles);
