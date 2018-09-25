const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const User = require('./user');
const Role = require('./role');
const Organization = require('./organization');

const UORoles = ModelBase.extend({
  tableName: 'users_organizations_roles',

  // Association
  users() {
    return this.belongsToMany(User, 'users_organizations_roles', 'user_id', 'id');
  },

  roles() {
    return this.belongsToMany(Role, 'roles', 'id', 'role_id');
  },

  organizations() {
    return this.belongsToMany(Organization, 'organizations', 'id', 'organization_id');
  }
},
{
  // Instance methods
},
{

  // Static methods
}

);

module.exports = Bookshelf.model('UORoles', UORoles);
