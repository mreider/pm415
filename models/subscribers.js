const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const Organization = require('./organization');
// const User = require('./user');

const Subscribers = ModelBase.extend({
  tableName: 'subscribers'
  // Association
  // organization() {
  //   return this.belongsTo(Organization);
  // }
},
{
}

);

module.exports = Bookshelf.model('Subscribers', Subscribers);
