const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const Roles = ModelBase.extend({
  tableName: 'roles'

  // Association

  // Instance methods

},
{
  AdminRole: 'Admin',
  AdminRoleId: '2',
  MemberRole: 'Member',
  MemberRoleId: '1',
  PendingRole: 'Pending',
  PendingRoleId: '3'
  // Static methods
});

module.exports = Bookshelf.model('Roles', Roles);
