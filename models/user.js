const Crypto = require('crypto');
const Jwt = require('jsonwebtoken');

const ModelBase = require('../db').modelBase;

const Config = require('../config');
const Bookshelf = require('../db').bookshelf;
const UORoles = require('./users_organizations_roles');

const Organization = require('./organization');
const Role = require('./role');

const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha512';

const User = ModelBase.extend({
  tableName: 'users',

  // Association

  organizations() {
    return this.belongsToMany(Organization, 'users_organizations_roles', 'user_id', 'organization_id');
  },

  roles() {
    return this.belongsToMany(Role, 'users_organizations_roles', 'user_id', 'role_id');
  },

  // Instance methods

  checkPassword(password) {
    var self = this;

    return new Promise(async (resolve, reject) => {
      const parts = self.get('password').split('.');

      if (parts.length !== 3) return reject(new Error('Password missing or incorrect'));

      const salt = parts[0];

      try {
        const hashed = await User.hashPassword(password, salt);
        if (hashed !== self.get('password')) return reject(new Error('Password mismatch'));

        return resolve(self);
      } catch (error) {
        reject(error);
      }
    });
  },

  generateToken(opts, data) {
    return new Promise((resolve, reject) => {
      data = Object.assign({}, { userId: this.get('id') }, data);
      const jwtOptions = Object.assign({}, Config.jwtOptions, opts);
      resolve(Jwt.sign(data, Config.appKey, jwtOptions));
    });
  }
}, {
  // Static methods

  AdminRole: 'Admin',
  PendingRole: 'Pending',

  async hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
      if (!salt) {
        salt = Crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
      }

      Crypto.pbkdf2(password, salt, Iterations, PasswordLength, Digest, (error, hash) => {
        if (error) return reject(error);

        resolve([salt, Iterations.toString(), hash.toString('hex')].join('.'));
      });
    });
  },

  async hasRole(userId, orgId) {
    const hasRole = await UORoles.where({ user_id: userId, organization_id: orgId }).fetch();
    return hasRole;
  },

  validateToken(token) {
    let decoded = null;

    try {
      decoded = Jwt.verify(token, Config.appKey);
    } catch (error) {
      if (error.name === 'TokenExpiredError') return { valid: true, expired: true };

      return { valid: false };
    }

    const expirationDate = new Date(decoded.exp * 1000);

    if (new Date() > expirationDate) {
      return { valid: true, expired: true };
    }

    return {
      valid: true,
      data: decoded,
      expired: false
    };
  },

  verifyUser(token) {
    return new Promise(async (resolve, reject) => {
      const validated = this.validateToken(token);

      if (!validated.valid || !validated.data) return reject(new Error('Token invalid'));
      if (validated.expired) return reject(new Error({ message: 'Confirmation url expired', expired: true }));

      try {
        const user = await User.findById(validated.data.userId);

        if (!user) return reject(new Error('User not found'));
        if (user.get('confirmedAt')) return reject(new Error({ message: 'User already confirmed', alreadyConfirmed: true }));

        user.set({ confirmedAt: new Date() });
        await user.save();

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  },

  resetPassword(token, password, confirmation) {
    return new Promise(async (resolve, reject) => {
      if (password !== confirmation) return reject(new Error('Password and confirmation does not match'));

      const validated = this.validateToken(token);

      if (!validated.valid) return reject(new Error('Token invalid'));
      if (validated.expired) return reject(new Error({ message: 'Confirmation url expired', expired: true }));
      try {
        const user = await User.findById(validated.data.userId);
        if (!user) return reject(new Error('User not found'));
        const hash = await this.hashPassword(password);
        user.set({ password: hash });
        await user.save();

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  },

  async create(email, password, firstName, lastName, organization) {
    const hash = await this.hashPassword(password);
    return User.forge({ email, password: hash, firstName, lastName }).save();
  }
});

module.exports = Bookshelf.model('User', User);
