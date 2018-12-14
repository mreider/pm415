const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const Backlog = require('./backlog');
const Bug = require('./bugs');
const Item = require('./items');
const Initiative = require('./initiative');
const Utils = require('../utils');

const Connections = ModelBase.extend({
  tableName: 'connections',
  // Association
  backlogs() {
    return this.belongsTo(Backlog);
  },
  items() {
    return this.belongsTo(Item);
  },
  initiatives() {
    return this.belongsTo(Initiative);
  }
},
{
  async connectionsList(id, owner, needInfo) {
    const validParams = ['backlog', 'initiative', 'item', 'bug'];

    if (validParams.indexOf(owner) === -1 || validParams.indexOf(needInfo) === -1) return [];
    let connections = await this.where(owner + '_id', '=', id).fetchAll();
    connections = Utils.serialize(connections);

    let ids = [];
    connections.forEach(element => {
      ids.push(element[needInfo + 'Id']);
    });

    let info = [];

    if (needInfo === 'backlog') {
      info = await Backlog.where('id', 'in', ids).fetchAll();
    } else if (needInfo === 'initiative') {
      info = await Initiative.where('id', 'in', ids).fetchAll();
    } else if (needInfo === 'item') {
      info = await Item.where('id', 'in', ids).fetchAll();
    } else if (needInfo === 'bug') {
      info = await Bug.where('id', 'in', ids).fetchAll();
    };

    return Utils.serialize(info);
  }
}

);

module.exports = Bookshelf.model('Connections', Connections);
