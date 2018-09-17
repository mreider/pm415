const Config = require('../config');
const Sequelize = require('sequelize');

module.exports = exports = {};

exports.Db = new Sequelize(Config.databaseUri);
