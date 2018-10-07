const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const User = require('./user');

const Organization = ModelBase.extend({
  tableName: 'organizations',

  // Association
  users() {
    return this.belongsToMany(User, 'users_organizations_roles', 'organization_id', 'user_id');
  }
},
{
  // Static methods
}

);

module.exports = Bookshelf.model('Organization', Organization);
