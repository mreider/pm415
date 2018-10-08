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
  AdminRoleId: 1,
  MemberRole: 'Member',
  MemberRoleId: 2,
  PendingRole: 'Pending',
  PendingRoleId: 3,

  sort(rolesList) {
    return rolesList.sort((roleA, roleB) => {
      const aId = typeof roleA.get === 'function' ? roleA.get('id') : roleA.id;
      const bId = typeof roleB.get === 'function' ? roleB.get('id') : roleB.id;

      if (aId < bId) return -1;
      if (aId > bId) return 1;
      return 0;
    });
  }
});

module.exports = Bookshelf.model('Roles', Roles);
