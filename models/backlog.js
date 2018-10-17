const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const User = require('./user');

const Backlogs = ModelBase.extend({
  tableName: 'Backlogs'

  // Association
  // users() {
  //   return this.belongsToMany(User, 'users_organizations_roles', 'organization_id', 'user_id');
  // }
},
{
  // Static methods
}

);

module.exports = Bookshelf.model('Backlogs', Backlogs);
