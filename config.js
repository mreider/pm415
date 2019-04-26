const path = require('path');
const domain = process.env.DOMAIN_URL;
const feedlist = process.env.FEEDLIST.split(',');
const config = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !this.isProduction,

  keepAwake: !!process.env.KEEP_PROCESS_AWAKE,

  siteUrl: process.env.SITEURL_DEV + ':' + process.env.PORT,
  appKey: process.env.APPKEY,

  port: process.env.PORT || 8080,
  domain,
  feedList: feedlist,

  db: {
    databaseUri: process.env.DATABASE_URL,

    options: {
      operatorsAliases: false,
      dialect: 'mysql',
      freezeTableName: true
    }
  },

  elasticsearch: process.env.ELASTIC_SEARCH_URL,

  cors: {
    credentials: true,
    origin: function(origin, callback) {
      if (typeof origin === 'undefined') return callback(null, true);

      const whitelist = process.env.WHITELIST.split(',');

      for (let i = 0; i < whitelist.length; i++) {
        const element = whitelist[i];

        if (element.test(origin)) return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS: "${origin}"`));
    },
    optionsSuccessStatus: 200
  },

  jwtOptions: {
    expiresIn: '7d'
  },

  bearerOptions: {
    bodyKey: 'access_token',
    queryKey: 'access_token',
    headerKey: 'Bearer',
    reqKey: 'token'
  },

  mailerConfig: {
    auth: {
      api_user: process.env.SENDGRID_USERNAME,
      api_key: process.env.SENDGRID_PASSWORD
    },
    from: 'do-not-reply@' + domain,
    confirmationExpiration: 24 * 60 * 60 * 1000,
    rendererConfig: {
      viewPath: path.join(__dirname, 'templates/emails/'),
      extName: '.handlebars'
    }
  }
};

if (process.env.NODE_ENV === 'production') {
  config.siteUrl = 'https://' + process.env.DOMAIN_URL;
}

module.exports = config;
