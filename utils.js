const OmitDeep = require('omit-deep');

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
