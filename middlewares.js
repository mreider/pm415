
const Jwt = require('jsonwebtoken');
const Url = require('url');
const Config = require('./config');
const User = require('./models/user');
const Utils = require('./utils');
const Role = require('./models/role');

module.exports = {
  UserTokenMiddleware: () => {
    return async (req, res, next) => {
      if (!req.token) return next(null);
      req.roleId = 0;
      try {
        const decoded = Jwt.verify(req.token, Config.appKey);

        const user = await User.where({ 'id': decoded.userId }).fetch({ withRelated: ['organizations.roles'] });
        req.user = user;
        req.organization = user.related('organizations').filter(org => org.get('id') === decoded.organizationId)[0];
        const role = await User.Role(decoded.userId, decoded.organizationId);
        if (role) req.roleId = Utils.serialize(role).roleId;
        if (!role) req.roleId = 0;
        next(null);
      } catch (error) {
        next(null);
      }
    };
  },

  LoginRequired: (req, res, next) => {
    if (!req.user) {
      return res.boom.unauthorized('Authentication required', { success: false });
    }

    if (!req.user.get('isActive') || !req.user.get('confirmedAt')) {
      return res.boom.forbidden('User not confirmed or inactive', { success: false });
    }

    next(null);
  },

  OrgAdminRequired: (req, res, next) => {
    var redirect = req.headers.referer ? Url.parse(req.headers.referer).path : '/';

    if (!req.user) {
      return res.boom.unauthorized('Authentication required', { success: false, redirect: '/login?next=' + redirect });
    }

    if (!req.user.get('isActive') || !req.user.get('confirmedAt')) {
      return res.boom.forbidden('User not confirmed or inactive', { success: false });
    }

    if (!req.organization) {
      return res.boom.forbidden('User must be assigned to organization first', { success: false });
    }

    // TODO: Add role in organization check here instead of user role check
    if (req.roleId != Role.AdminRoleId) {
      return res.boom.unauthorized('Admin privileges required', { success: false, redirect: '/login?next=' + redirect });
    }

    next(null);
  }
};
