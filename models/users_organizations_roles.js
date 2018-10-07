const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const User = require('./user');
const Role = require('./role');
const Organization = require('./organization');

const UORoles = ModelBase.extend({
  tableName: 'users_organizations_roles',

  // Association
  user() {
    return this.belongsTo(User);
  },

  role() {
    return this.belongsTo(Role);
  },

  organization() {
    return this.belongsTo(Organization);
  }
},
{
  // Static methods

  async getUser(userId) {
    const rows = await this.where({ user_id: userId }).fetchAll({withRelated: ['user', 'role', 'organization']});
    console.log(rows);

    let user = null;
    const organizations = {};

    rows.forEach(row => {
      if (!user && row.related('user')) {
        user = row.related('user').toJSON();
      }

      let org = row.related('organization');

      if (!organizations[org.get('id')]) {
        organizations[org.get('id')] = org.toJSON();
        organizations[org.get('id')].roles = [];
      }

      org = organizations[org.get('id')];
      org.roles.push(row.related('role').toJSON());
    });

    user.organizations = Object.keys(organizations).map(key => organizations[key]);

    return user;
  }
}

);

module.exports = Bookshelf.model('UORoles', UORoles);
