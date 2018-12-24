const OmitDeep = require('omit-deep');
const _ = require('lodash');
const Role = require('./models/role');
const Axios = require('axios');
const config = require('./config');
const User = require('./models/user');

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

exports.serializeToIndex = async function(obj, type) {
  if (!obj) return undefined;
  if (typeof obj.toJSON === 'function') obj = obj.toJSON();

  let newObj = {
    title: '',
    description: '',
    type: '',
    author: {},
    assignee: {},
    organization: '',
    id: ''
  };

  if (obj.hasOwnProperty('title')) {
    newObj.title = obj.title;
  };
  if (obj.hasOwnProperty('description')) {
    newObj.description = obj.description;
  };
  newObj.type = type;

  if (obj.hasOwnProperty('createdBy') && !obj.hasOwnProperty('created_by')) {
    newObj.author.id = obj.createdBy;
  } else if (!obj.hasOwnProperty('createdBy') && obj.hasOwnProperty('created_by')) {
    newObj.author.id = obj.created_by;
  };

  if (obj.hasOwnProperty('assignee')) {
    newObj.assignee.id = obj.assignee;
  };
  if (obj.hasOwnProperty('organizationId') && !obj.hasOwnProperty('organization_id')) {
    newObj.organization = obj.organizationId;
  } else if (!obj.hasOwnProperty('organizationId') && obj.hasOwnProperty('organization_id')) {
    newObj.organization = obj.organization_id;
  };

  if (obj.hasOwnProperty('id')) {
    newObj.id = obj.id;
  };
  if (newObj.author.id) {
    const user = await User.where({ id: newObj.author.id }).fetch();
    newObj.author = this.serialize(user);
  };
  if (newObj.assignee.id) {
    const user = await User.where({ id: newObj.assignee.id }).fetch();
    newObj.assignee = this.serialize(user);
  };
  return newObj;
};

exports.isPendingUser = function (orgId, req) {
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });
  if (!organization) return true;

  const RolePending = _.find(organization.roles, role => { return role.id === Role.PendingRoleId; });
  if (RolePending) return true;

  return false;
};

exports.username = function (user) {
  if (!user) return '';
  const { firstName, lastName, email } = user;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  else if (firstName) return firstName;
  else if (lastName) return lastName;

  return email;
};

exports.addDataToIndex = async function (data, indexName, method) {
  const dataToElastic = await this.serializeToIndex(data, indexName);
  await Axios[method](config.elasticsearch + '/' + indexName + '/' + indexName + '/' + dataToElastic.id, dataToElastic);
  // const success = _.get(response, 'data');
  // return success;
};

exports.search = async function (where, request, orgId) {
  let searchJson = {};
  searchJson.query = {};
  let must = [];
  must.push({ multi_match: { query: request, fields: ['title', 'description'], type: 'cross_fields' } });
  must.push({ match: { organization: orgId } });
  searchJson.query.bool = { must: must };

  let response = await Axios.post(config.elasticsearch + '/' + '_search', searchJson);

  response = _.get(response, 'data.hits');
  // console.log(response);
  return response;
};
