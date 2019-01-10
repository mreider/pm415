const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;
const _ = require('lodash');
const knex = require('../db').knex;
const Utils = require('../utils');

// const Organization = require('./organization');
const User = require('./user');
const Status = require('./statuses');

const Items = ModelBase.extend({
  tableName: 'items',
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
    if (fullSelect === true) columns = ['created_at as createdAt', 'archived', 'owner_id as ownerId', 'points', 'assignee', 'id', 'title', 'description', 'status_id as statusId', 'created_by as createdBy', 'forecasted_release as forecastedRelease', 'actual_release as actualRelease', 'planned_on as plannedOn'];
    if (fullSelect === false) columns = ['id', 'title', 'status_id as statusId', 'archived', 'created_by as createdBy', 'owner_id as ownerId'];
    if (prefix) {
      columns = columns.map(function(element) {
        return prefix + element;
      });
    }
    if (elementstopush) columns = _.union(elementstopush, columns);
    return { columns };
  },

  async getAllBacklogMailers(id, ownerTable) {
    let rows = await knex(ownerTable + ' as i').select('mailers').where({ id: id });
    rows = Utils.serialize(rows);
    const ownerMailers = rows[0].mailers;

    rows = await knex('comments' + ' as i').select('mailers').where({ owner_id: id });
    rows = Utils.serialize(rows);

    const commentMailers = rows[0].mailers;
    const stringToPars = ownerMailers + commentMailers;

    let mailers = [];
    let result = stringToPars.match(/!.+?(!)/gi);
    mailers.length = 0;

    if (result) mailers = _.union(result);
    mailers = mailers.map(function(el) { return el.replace(/!/g, ''); });

    return mailers;
    // temp change to emty array
    // return [];
  }

  // Static methods
}

);

module.exports = Bookshelf.model('Items', Items);
