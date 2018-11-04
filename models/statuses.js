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
  statusUnplannedId: 1,
  statusPlannedId: 2,
  statusDoingId: 3,
  statusDoneId: 4,
  // Static methods
  fieldsToShow() {
    return { columns: ['name', 'id'] };
  }
}

);

module.exports = Bookshelf.model('Statuses', Statuses);
