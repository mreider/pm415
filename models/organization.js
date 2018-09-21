const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const User = require('./user');
const Role = require('./role');

const Organization = ModelBase.extend({
  tableName: 'organizations',

  // Association

  users() {
    return this.belongsToMany(User, 'users_organizations_roles', 'organization_id', 'user_id');
  },

  roles() {
    return this.belongsToMany(Role, 'users_organizations_roles', 'organization_id', 'role_id');
  }

  // Instance methods

}, {
  // Static methods
});

module.exports = Bookshelf.model('Organization', Organization);
