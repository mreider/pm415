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
  // Static methods
}

);

module.exports = Bookshelf.model('Comments', Comments);
