const _ = require('lodash');
const Axios = require('axios');
const config = require('./config');
const User = require('./models/user');
const Utils = require('./utils');
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
    ownerId: '',
    archived: 0
  };

  if (obj.hasOwnProperty('title')) {
    newObj.title = obj.title;
  };
  if (obj.hasOwnProperty('archived')) {
    if (obj.archived === true) {
      obj.archived = 1;
    } else {
      obj.archived = 0;
    };
    newObj.archived = obj.archived;
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
    ownerId: '',
    archived: 0
  };

  if (!obj.hasOwnProperty('ownerId') && obj.hasOwnProperty('owner_id')) {
    obj.ownerId = obj.owner_id;
  };
  if (obj.hasOwnProperty('ownerId')) {
    let rows = await knex(obj.ownerTable + ' as i').select('title', 'id', 'archived').where({ id: obj.ownerId });
    rows = Utils.serialize(rows);
    let owner = rows[0];

    if (owner) {
      newObj.title = owner.title;
      newObj.description = obj.comment;
      newObj.id = obj.id;
      newObj.ownerId = obj.ownerId;
      newObj.ownerTable = obj.ownerTable;
      if (owner.archived === true) {
        owner.archived = 1;
      } else {
        owner.archived = 0;
      };
      newObj.archived = owner.archived;
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
  };
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
    fields: ['title', 'description', 'comment', 'author.firstName', 'author.lastName', 'author.email', 'assignee.firstName', 'assignee.lastName', 'assignee.email', 'ownerTable'],
    type: 'phrase_prefix' }
  });
  let ownerMatch = {};
  ownerMatch.match = where;
  must.push(ownerMatch);
  searchJson.query.bool = { must: must };
  let response = {};
  try {
    response = await Axios.post(config.elasticsearch + '/_all/' + '_search/?size=10000', searchJson);
  } catch (error) {
    return response;
  };
  response = _.get(response, 'data.hits');
  response.query = searchJson;
  return response;
};
