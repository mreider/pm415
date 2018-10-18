const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

// const User = require('./user');

const Backlogs = ModelBase.extend({
  tableName: 'Backlogs'
  // Association
  // users() {
  //   return this.belongsToMany(User, 'users_organizations_roles', 'organization_id', 'user_id');
  // }
},
{
  fieldsToShow(fullSelect) {
    if (fullSelect === true) return { columns: ['assignee', 'id', 'title', 'description', 'status_id', 'deleted', 'created_by', 'forecasted_release', 'actual_release', 'planned_on'] };
    if (fullSelect === false) return { columns: ['id', 'title', 'status_id', 'deleted', 'created_by'] };
  }
  // Static methods
}

);

module.exports = Bookshelf.model('Backlogs', Backlogs);
