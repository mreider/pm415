const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const Organization = require('./organization');
// const User = require('./user');

const Votes = ModelBase.extend({
  tableName: 'votes'
  // Association
  // organization() {
  //   return this.belongsTo(Organization);
  // }
},
{
}

);

module.exports = Bookshelf.model('Votes', Votes);
