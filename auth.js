
const Jwt = require('jsonwebtoken');
const Url = require('url');
const Config = require('./config');
const User = require('./models/user');

module.exports = {
  UserTokenMiddleware: () => {
    return async (req, res, next) => {
      if (!req.token) return next(null);

      try {
        const decoded = Jwt.verify(req.token, Config.appKey);
        const user = await User.findById(decoded.userId);
        if (user) req.user = user;
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

    if (!req.user.isActive || !req.user.confirmedAt) {
      return res.boom.forbidden('User not confirmed or inactive', {success: false});
    }

    next(null);
  },

  AdminRequired: (req, res, next) => {
    var redirect = req.headers.referer ? Url.parse(req.headers.referer).path : '/';

    if (!req.user) {
      return res.boom.unauthorized('Authentication required', {success: false, redirect: '/login?next=' + redirect});
    }

    if (!req.user.isActive || !req.user.confirmedAt) {
      return res.boom.forbidden('User not confirmed or inactive', {success: false});
    }

    if (!req.user.hasRole(User.AdminRole)) {
      return res.boom.unauthorized('Admin privileges required', {success: false, redirect: '/login?next=' + redirect});
    }

    next(null);
  }
};
