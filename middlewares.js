
const Jwt = require('jsonwebtoken');
// const Url = require('url');
const Config = require('./config');
const User = require('./models/user');
const Organization = require('./models/organization');

module.exports = {
  UserTokenMiddleware: () => {
    return async (req, res, next) => {       
      //console.log("+", req.token);
      if (!req.token) return next(null);

      try {
        
        const decoded = Jwt.verify(req.token, Config.appKey);
        const [user, organization] = await Promise.all([
          User.where({id: decoded.userId}).fetch({withRelated: ['organizations']}),
          Organization.where({id: decoded.organizationId || 0}).fetch()
        ]);

        req.user = user;
        req.organization = organization;


        next(null);
      } catch (error) {
        next(null);
      }
    };
  },

  LoginRequired: (req, res, next) => {
    if (!req.user) {
      return res.boom.unauthorized('Authentication required', {success: false});
    }

    if (!req.user.get('isActive') || !req.user.get('confirmedAt')) {
      return res.boom.forbidden('User not confirmed or inactive', {success: false});
    }

    next(null);
  },

  // AdminRequired: (req, res, next) => {
  //   var redirect = req.headers.referer ? Url.parse(req.headers.referer).path : '/';

  //   if (!req.user) {
  //     return res.boom.unauthorized('Authentication required', {success: false, redirect: '/login?next=' + redirect});
  //   }

  //   if (!req.user.get('isActive') || !req.user.get('confirmedAt')) {
  //     return res.boom.forbidden('User not confirmed or inactive', {success: false});
  //   }

  //   if (!req.user.hasRole(User.AdminRole)) {
  //     return res.boom.unauthorized('Admin privileges required', {success: false, redirect: '/login?next=' + redirect});
  //   }

  //   next(null);
  // }
};
