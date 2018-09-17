const Winston = require('winston');

// const Config = require('./config');

const transports = [new Winston.transports.Console()];

// if (Config.isProduction) {
//   require('winston-mongodb');

//   transports.push(new Winston.transports.MongoDB({
//     level: 'warning',
//     db: Config.databaseUri,
//     collection: 'logs',
//     storeHost: true,
//     decolorize: true,
//     expireAfterSeconds: 2 * 7 * 24 * 60 * 60    // 2 weeks
//   }));
// }

module.exports = new Winston.Logger({
  level: 'verbose',
  transports
}); 
