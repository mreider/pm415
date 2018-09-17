const path = require('path');

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !this.isProduction,

  keepAwake: !!process.env.KEEP_PROCESS_AWAKE,

  siteUrl: 'https://example.com/',
  appKey: '097129fcba444e2dbb8c91ab7002604f7c27503fcf4b46c18708f2852cb654dc',

  port: process.env.PORT || 3000,

  db: {
    databaseUri: process.env.CLEARDB_DATABASE_URL,

    options: {
      operatorsAliases: false,
      dialect: 'mysql',
      underscored: true
    }
  },

  // Temporary disabled until code deployed for test
  // cors: {
  //   credentials: true,
  //   origin: function(origin, callback) {
  //     if (typeof origin === 'undefined') return callback(null, true);

  //     const whitelist = [
  //       /localhost/,
  //       /zagnut.herokuapp.com/
  //     ];

  //     for (let i = 0; i < whitelist.length; i++) {
  //       const element = whitelist[i];

  //       if (element.test(origin)) return callback(null, true);
  //     }

  //     callback(new Error(`Not allowed by CORS: "${origin}"`));
  //   },
  //   optionsSuccessStatus: 200
  // },

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
    from: 'info@domain.com',
    confirmationExpiration: 24 * 60 * 60 * 1000,
    rendererConfig: {
      viewPath: path.join(__dirname, '/../templates/emails/'),
      extName: '.hbs.html'
    }
  }
};
