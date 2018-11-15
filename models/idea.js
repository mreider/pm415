const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');

// const Organization = require('./organization');
const User = require('./user');

const Ideas = ModelBase.extend({
  tableName: 'ideas',
  // Association
  Author() {
    return this.belongsTo(User, 'created_by');
  }
},
{
  fieldsToShow(fullSelect, prefix, elementstopush) {
    let columns;

    if (fullSelect) {
      columns = ['created_at as createdAt', 'id', 'title', 'description', 'horizon', 'created_by as createdBy', 'importance', 'organization_id as OrganizationId'];
    } else {
      columns = ['id', 'title', 'created_by as createdBy'];
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

module.exports = Bookshelf.model('Ideas', Ideas);
