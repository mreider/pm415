const Express = require('express');
require('express-async-errors');
const Cors = require('cors');
const BodyParser = require('body-parser');
const MethodOverride = require('method-override');
const Boom = require('express-boom');
const BearerToken = require('express-bearer-token');
const Http = require('http');
const Https = require('https');
const Logger = require('./logger');
const Config = require('./config');
const RenderRouter = require('./routes/render-router');
const AccountRouter = require('./routes/account-router');
const UserRouter = require('./routes/user-router');
const OrgRouter = require('./routes/org-router');
const ApplicationRouter = require('./routes/app-router');
const ErrorHandler = require('./routes/error-handler');
const UserTokenMiddleware = require('./middlewares').UserTokenMiddleware;
// const db = require('./db');

const promiseDb = async () => {
  return Promise.resolve();
  // return new Promise((resolve, reject) => {
  //   db.authenticate().then(() => {
  //     Logger.info('Connection to mysql database has been established successfully.');
  //     resolve(db);
  //   }).catch(error => {
  //     Logger.error(`Unable to connect to mysql database: ${error}, stack: ${error.stack}`);
  //     reject(error);
  //   });
  // });
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
    app.use('/', RenderRouter);
    app.use('/api/', ApplicationRouter);
    app.use('/api/account', AccountRouter);
    app.use('/api/user', UserRouter);
    app.use('/api/org', OrgRouter);

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
