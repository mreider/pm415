const OmitDeep = require('omit-deep');
const _ = require('lodash');
const Role = require('./models/role');

module.exports = exports = {};

exports.serialize = function(obj) {
  if (!obj) return undefined;
  if (typeof obj.toJSON === 'function') obj = obj.toJSON();

  const serialized = OmitDeep(obj, [
    'password',
    'isActive',
    'confirmedAt',
    'createdAt',
    'updatedAt',
    '_pivot_user_id',
    '_pivot_organization_id',
    '_pivot_role_id'
  ]);

  return serialized;
};

exports.isPendingUser = function (orgId, req) {
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });
  if (!organization) return true;

  const RolePending = _.find(organization.roles, role => { return role.id === Role.PendingRoleId; });
  if (RolePending) return true;

  return false;
};
