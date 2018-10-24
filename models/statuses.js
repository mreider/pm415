const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const Organization = require('./organization');
// const User = require('./user');

const Statuses = ModelBase.extend({
  tableName: 'statuses'
  // Association
  // organization() {
  //   return this.belongsTo(Organization);
  // }
},
{
  // Static methods
  fieldsToShow() {
    return { columns: ['name', 'id'] };
  }
}

);

module.exports = Bookshelf.model('Statuses', Statuses);
