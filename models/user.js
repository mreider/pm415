'use strict';

const Crypto = require('crypto');
const Jwt = require('jsonwebtoken');
const Helpers = require('./helpers');

const Config = require('../config');
const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha512';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', Helpers.fixFields({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING(384), allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: false },
    confirmedAt: DataTypes.DATE,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }), {
    tableName: 'users'
  });

  User.associate = function(models) {
    User.hasMany(models.Role);
  };

  User.AdminRole = 'admin';

  User.validateToken = function(token) {
    let decoded = null;

    try {
      decoded = Jwt.verify(token, Config.appKey);
    } catch (error) {
      if (error.name === 'TokenExpiredError') return {valid: true, expired: true};

      return {valid: false};
    }

    const expirationDate = new Date(decoded.exp * 1000);

    if (new Date() > expirationDate) {
      return {valid: true, expired: true};
    }

    return {
      valid: true,
      data: decoded,
      expired: false
    };
  };

  User.hashPassword = function(password, salt) {
    return new Promise((resolve, reject) => {
      if (!salt) {
        salt = Crypto.randomBytes(SaltLen).toString('hex').slice(0, SaltLen);
      }

      Crypto.pbkdf2(password, salt, Iterations, PasswordLength, Digest, (error, hash) => {
        if (error) return reject(error);

        resolve([salt, Iterations.toString(), hash.toString('hex')].join('.'));
      });
    });
  };

  User.create = function(email, password, isActive = true, roles = []) {
    return new Promise(async (resolve, reject) => {
      const user = new User({
        email: email,
        password: password,
        isActive: isActive,
        confirmedAt: null,
        roles: roles
      });

      try {
        user.password = await User.hashPassword(password);
        await user.save();

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  };

  User.verifyUser = function(token) {
    return new Promise(async (resolve, reject) => {
      const validated = User.validateToken(token);

      if (!validated.valid || !validated.data) return reject(new Error('Token invalid'));
      if (validated.expired) return reject(new Error({message: 'Confirmation url expired', expired: true}));

      try {
        const user = await User.findById(validated.data.userId);

        if (!user) return reject(new Error('User not found'));
        if (user.confirmedAt) return reject(new Error({message: 'User already confirmed', alreadyConfirmed: true}));

        user.confirmedAt = new Date();
        await user.save();

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  };

  User.assignRoles = function(userId, roles = []) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findById(userId);
        if (!user) return reject(new Error('User not found'));

        user.roles = Array.from(new Set([].concat(roles).concat(user.roles)));
        await user.save();

        resolve(user);
      } catch (error) {
        reject(error);
      }
    });
  };

  User.prototype.checkPassword = function(password) {
    var self = this;

    return new Promise(async (resolve, reject) => {
      const parts = self.password.split('.');

      if (parts.length !== 3) return reject(new Error('Password missing or incorrect'));

      const salt = parts[0];

      try {
        const hashed = await User.hashPassword(password, salt);
        if (hashed !== self.password) return reject(new Error('Password mismatch'));

        return resolve(self);
      } catch (error) {
        reject(error);
      }
    });
  };

  User.prototype.generateToken = function(optsOverride) {
    return new Promise((resolve, reject) => {
      const data = {userId: this.id};
      const options = Object.assign({}, Config.jwtOptions, optsOverride);
      resolve(Jwt.sign(data, Config.appKey, options));
    });
  };

  User.prototype.hasRole = function(role) {
    return this.roles.indexOf(role) !== -1;
  };

  return User;
};
