const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const User = require('./user');

const Roles = ModelBase.extend({
  tableName: 'roles',

  // Association

  users() {
    return this.belongsToMany(User, 'users_organizations_roles', 'organization_id', 'user_id');
  }
  // Instance methods

}, {
  // Static methods
});

module.exports = Bookshelf.model('Roles', Roles);
