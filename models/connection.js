const ModelBase = require('../db').modelBase;
const Bookshelf = require('../db').bookshelf;

const Backlog = require('./backlog');
const Item = require('./items');
const Initiative = require('./initiative');

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
}

);

module.exports = Bookshelf.model('Connections', Connections);
