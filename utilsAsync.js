const _ = require('lodash');
const Role = require('./models/role');
const Axios = require('axios');
const config = require('./config');
const User = require('./models/user');
const Utils = require('./Utils');
const knex = require('./db').knex;

module.exports = exports = {};

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
    id: '',
    createdOn: '',
    ownerId: ''
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
  if (obj.hasOwnProperty('ownerId')) {
    newObj.ownerId = obj.ownerId;
  };
  if (newObj.author.id) {
    const user = await User.where({ id: newObj.author.id }).fetch();
    newObj.author = Utils.serialize(user);
  };
  if (newObj.assignee.id) {
    const user = await User.where({ id: newObj.assignee.id }).fetch();
    newObj.assignee = Utils.serialize(user);
  };
  if (obj.hasOwnProperty('created_at') && !obj.hasOwnProperty('createdAt')) {
    newObj.createdOn = obj.created_at;
  } else if (!obj.hasOwnProperty('created_at') && obj.hasOwnProperty('createdAt')) {
    newObj.createdOn = obj.createdAt;
  }
  return newObj;
};

exports.serializeToIndexComment = async function(obj) {
  if (!obj) return undefined;
  if (typeof obj.toJSON === 'function') obj = obj.toJSON();

  let newObj = {
    title: '',
    description: '',
    type: 'comments',
    author: {},
    organization: '',
    id: '',
    createdOn: '',
    ownerTable: '',
    ownerId: ''
  };

  if (obj.hasOwnProperty('ownerId')) {
    let rows = await knex(obj.ownerTable + ' as i').select('title', 'id').where({ id: obj.ownerId });
    rows = Utils.serialize(rows);
    let owner = rows[0];
    if (owner) {
      newObj.title = owner.title;
      newObj.description = obj.comment;
      newObj.id = owner.id;
      newObj.ownerId = obj.ownerId;
      newObj.ownerTable = obj.ownerTable;
    };
  };
  if (obj.hasOwnProperty('createdBy') && !obj.hasOwnProperty('created_by')) {
    newObj.author.id = obj.createdBy;
  } else if (!obj.hasOwnProperty('createdBy') && obj.hasOwnProperty('created_by')) {
    newObj.author.id = obj.created_by;
  };
  if (newObj.author.id) {
    const user = await User.where({ id: newObj.author.id }).fetch();
    newObj.author = Utils.serialize(user);
  };
  if (obj.hasOwnProperty('organizationId') && !obj.hasOwnProperty('organization_id')) {
    newObj.organization = obj.organizationId;
  } else if (!obj.hasOwnProperty('organizationId') && obj.hasOwnProperty('organization_id')) {
    newObj.organization = obj.organization_id;
  };
  if (obj.hasOwnProperty('created_at') && !obj.hasOwnProperty('createdAt')) {
    newObj.createdOn = obj.created_at;
  } else if (!obj.hasOwnProperty('created_at') && obj.hasOwnProperty('createdAt')) {
    newObj.createdOn = obj.createdAt;
  }
  return newObj;
};

exports.isPendingUser = function (orgId, req) {
  const organization = _.find(req.user.organizations, org => { return org.id === orgId; });
  if (!organization) return true;

  const RolePending = _.find(organization.roles, role => { return role.id === Role.PendingRoleId; });
  if (RolePending) return true;

  return false;
};

exports.addDataToIndex = async function (data, indexName, method) {
  let dataToElastic;
  if (indexName === 'comments') {
    dataToElastic = await this.serializeToIndexComment(data, indexName);
  } else {
    dataToElastic = await this.serializeToIndex(data, indexName);
  };
  try {
    await Axios[method](config.elasticsearch + '/' + indexName + '/' + indexName + '/' + dataToElastic.id, dataToElastic);
  } catch (error) {
    return false;
  }
  return true;
};

exports.userName = async function(userId) {
  let user = await User.where({ id: userId }).fetch();
  user = user.toJSON();
  return Utils.username(user);
};

exports.search = async function (where, request, orgId) {
  let searchJson = {};
  searchJson.query = {};
  let must = [];
  must.push({ multi_match: {
    query: request,
    fields: ['title', 'description', 'comment'],
    type: 'phrase_prefix' }
  });
  must.push({ match: { organization: orgId } });
  searchJson.query.bool = { must: must };
  let response = {};
  try {
    response = await Axios.post(config.elasticsearch + '/_all/' + '_search', searchJson);
  } catch (error) {
    return response;
  };
  response = _.get(response, 'data.hits');

  return response;
};
