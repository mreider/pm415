const path = require('path');
const domain = 'pm415.com';

const config = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !this.isProduction,

  keepAwake: !!process.env.KEEP_PROCESS_AWAKE,

  siteUrl: 'http://localhost:8080/',
  appKey: '097129fcba444e2dbb8c91ab7002604f7c27503fcf4b46c18708f2852cb654dc',

  port: process.env.PORT || 3000,
  domain,

  db: {
    databaseUri: process.env.DATABASE_URL,

    options: {
      operatorsAliases: false,
      dialect: 'mysql',
      freezeTableName: true
    }
  },

  cors: {
    credentials: true,
    origin: function(origin, callback) {
      if (typeof origin === 'undefined') return callback(null, true);

      const whitelist = [
        /localhost/,
        /zagnut.herokuapp.com/,
        /pm415.com/
      ];

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
  config.siteUrl = 'https://zagnut.herokuapp.com/';
}

module.exports = config;
