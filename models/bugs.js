const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');

// const Organization = require('./organization');
// const User = require('./user');
// const Status = require('./statuses');

const Bugs = ModelBase.extend({
  tableName: 'bugs'
  // Association
},
{
  fieldsToShow(fullSelect, prefix, elementstopush) {
    let columns;

    if (fullSelect) {
      columns = ['created_at as createdAt', 'assignee', 'id', 'title', 'description', 'status_id as statusId', 'created_by as createdBy', 'reported_by as reportedBy', 'severity'];
    } else {
      columns = ['id', 'title', 'description', 'status_id as statusId', 'created_by as createdBy', 'created_at as createdAt', 'severity', 'assignee'];
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

module.exports = Bookshelf.model('Bugs', Bugs);
