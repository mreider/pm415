const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const Organization = require('./organization');
// const User = require('./user');

const Backlogs = ModelBase.extend({
  tableName: 'Backlogs'
  // Association
  // organization() {
  //   return this.belongsTo(Organization);
  // }
},
{
  fieldsToShow(fullSelect) {
    if (fullSelect === true) return { columns: ['assignee', 'id', 'title', 'description', 'status_id', 'created_by', 'forecasted_release', 'actual_release', 'planned_on'] };
    if (fullSelect === false) return { columns: ['id', 'title', 'status_id', 'created_by'] };
  }
  // Static methods
}

);

module.exports = Bookshelf.model('Backlogs', Backlogs);
