const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');

const Organization = require('./organization');
const User = require('./user');
const Status = require('./statuses');

const Initiatives = ModelBase.extend({
  tableName: 'initiatives',
  // Association
  Author() {
    return this.belongsTo(User, 'created_by');
  },
  Status() {
    return this.belongsTo(Status, 'status_id');
  },
  Organization() {
    return this.belongsTo(Organization, 'organization_id');
  }
},
{
  fieldsToShow(fullSelect, prefix, elementstopush) {
    let columns;

    if (fullSelect) {
      columns = ['created_at as createdAt', 'id', 'title', 'archived', 'description', 'horizon', 'created_by as createdBy', 'status_id as statusId', 'organization_id as organizationId'];
    } else {
      columns = ['id', 'title', 'created_by as createdBy', 'archived'];
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

module.exports = Bookshelf.model('Initiatives', Initiatives);
