const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');

// const Organization = require('./organization');
const User = require('./user');

const Backlogs = ModelBase.extend({
  tableName: 'Backlogs',
  // Association
  Author() {
    return this.belongsTo(User, 'created_by');
  },
  Assignee() {
    return this.belongsTo(User, 'assignee');
  }
},
{
  fieldsToShow(fullSelect, prefix, elementstopush) {
    let columns;
    if (fullSelect === true) columns = ['created_at as createdAt', 'points', 'assignee', 'id', 'title', 'description', 'status_id as statusId', 'created_by as createdBy', 'forecasted_release as forecastedRelease', 'actual_release as actualRelease', 'planned_on as plannedOn'];
    if (fullSelect === false) columns = ['id', 'title', 'status_id as statusId', 'created_by as createdBy'];
    columns = columns.map(function(element) {
      return prefix + element;
    });
    if (elementstopush) columns = _.union(elementstopush, columns);
    return { columns };
  }
  // Static methods
}

);

module.exports = Bookshelf.model('Backlogs', Backlogs);
