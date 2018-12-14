const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
// const _ = require('lodash');

// const Organization = require('./organization');
// const User = require('./user');
// const Status = require('./statuses');

const Comments = ModelBase.extend({
  tableName: 'comments'
  // Association
},
{
  async getComments(organizationId, ownerTable, ownerId) {
    let comments = [];
    try {
      comments = await this.where({ organization_id: organizationId, owner_table: ownerTable, owner_id: ownerId }).fetchAll();
    } catch (error) {
      return [];
    };
    return comments;
  }
}

);

module.exports = Bookshelf.model('Comments', Comments);
