const Express = require('express');
require('express-async-errors');
const Cors = require('cors');
const BodyParser = require('body-parser');
const MethodOverride = require('method-override');
const Boom = require('express-boom');
const Mongoose = require('mongoose');
const BearerToken = require('express-bearer-token');
const Http = require('http');
const Https = require('https');
const Logger = require('./server/logger');
const Config = require('./server/config');
const AccountRouter = require('./server/routes/account-router');
const ApplicationRouter = require('./server/routes/app-router');
const ErrorHandler = require('./server/routes/error-handler');
const UserTokenMiddleware = require('./server/auth').UserTokenMiddleware;

const promiseDb = async () => {
  return new Promise((resolve, reject) => {
    let options = {};
    //console.log("11",Config.databaseUri);
    Mongoose.connect(Config.databaseUri, options);
    const db = Mongoose.connection;

    db.on('error', reject);
    db.once('open', () => { resolve(db); });
  });
};
 
const promiseApp = async () => {
  return new Promise((resolve, reject) => {
    var app = Express();

    app.disable('x-powered-by');

    app.use(BodyParser.urlencoded({ extended: false }));
    app.use(BodyParser.json());
    app.use(MethodOverride());
    app.use(BearerToken(Config.bearerOptions));
    app.use(Boom());

    app.use(Cors(Config.cors));
    app.options('*', Cors(Config.cors));

    app.use(UserTokenMiddleware());
    app.use('/api/', ApplicationRouter);    
    app.use('/api/account', AccountRouter);

    app.use(ErrorHandler);

    resolve(app);
  });
};

const promiseServer = async (app) => {
  return new Promise((resolve, reject) => {
    const server = Http.Server(app);
    resolve(server);
  });
};

const promiseRun = (server) => {
  const pollUrl = () => {
    if (Config.siteUrl.startsWith('https')) {
      try { Https.get(Config.siteUrl); } catch (error) { Logger.error(error); }
    } else {
      try { Http.get(Config.siteUrl); } catch (error) { Logger.error(error); }
    }
  };

  return new Promise((resolve, reject) => {
    server.listen(Config.port, () => {
      if (Config.keepAwake && Config.siteUrl) {
        setInterval(pollUrl, 5 * 60 * 1000);
        Logger.info('Ping service installed to poll app each 5 minutes.');
      }

      Logger.info('Server running on the port ' + Config.port);
      resolve();
    });
  });
};

async function initialize() {
  Logger.info('Starting app...');

  await promiseDb();
  Logger.info('Database connection initialized.');

  const app = await promiseApp();
  const server = await promiseServer(app);
  Logger.info('Server initialized.');

  await promiseRun(server);
}

initialize();
