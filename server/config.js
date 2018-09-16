const path = require('path');

module.exports = {
  isProduction: process.env.NODE_ENV === 'production',
  isDebug: !this.isProduction,

  keepAwake: !!process.env.KEEP_PROCESS_AWAKE,

  siteUrl: 'https://example.com/',
  appKey: 'piertp9n3tp9[jwef[p0Ywerph2;3JRO928TU-7U;IOHT;OAHWE89UYWP9E8TA3ERG',

  port: process.env.PORT || 3000,
  //databaseUri: process.env.MONGODB_URI, временно убрал не находил эту штуку
  databaseUri: "mongodb://localhost:27017",
  cors: {
    credentials: true,
    origin: function(origin, callback) {
      if (typeof origin === 'undefined') return callback(null, true);

      const whitelist = [
        /localhost/,
        /##PUT_SITE_NAME_HERE##.herokuapp.com/
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
    from: 'info@domain.com',
    confirmationExpiration: 24 * 60 * 60 * 1000,
    rendererConfig: {
      viewPath: path.join(__dirname, '/../templates/emails/'),
      extName: '.hbs.html'
    }
  }
};
 