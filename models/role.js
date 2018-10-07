const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const Roles = ModelBase.extend({
  tableName: 'roles'

  // Association

  // Instance methods
},
{
  // Static methods

  AdminRole: 'Admin',
  AdminRoleId: 2,
  MemberRole: 'Member',
  MemberRoleId: 1,
  PendingRole: 'Pending',
  PendingRoleId: 3
});

module.exports = Bookshelf.model('Roles', Roles);
