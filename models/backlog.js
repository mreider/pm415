const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');

// const Organization = require('./organization');
const User = require('./user');
const Status = require('./statuses');

const Backlogs = ModelBase.extend({
  tableName: 'backlogs',
  // Association
  Author() {
    return this.belongsTo(User, 'created_by');
  },

  Assignee() {
    return this.belongsTo(User, 'assignee');
  },

  Status() {
    return this.belongsTo(Status, 'status_id');
  }
},
{
  fieldsToShow(fullSelect, prefix, elementstopush) {
    let columns;

    if (fullSelect) {
      columns = ['created_at as createdAt', 'points', 'assignee', 'id', 'title', 'description', 'status_id as statusId', 'created_by as createdBy', 'forecasted_release as forecastedRelease', 'actual_release as actualRelease', 'planned_on as plannedOn'];
    } else {
      columns = ['id', 'title', 'status_id as statusId', 'created_by as createdBy'];
    };

    if (prefix) {
      columns = columns.map(function(element) {
        return prefix + element;
      });
    };
    if (elementstopush) columns = _.union(elementstopush, columns);

    return { columns };
  }
  // Static methods
}

);

module.exports = Bookshelf.model('Backlogs', Backlogs);
