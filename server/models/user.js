const Mongoose = require('mongoose');
const Crypto = require('crypto');
const Jwt = require('jsonwebtoken');

const Config = require('../config');
const PasswordLength = 128;
const SaltLen = 16;
const Iterations = 10000;
const Digest = 'sha512';
//sham
const Sequelize = require('sequelize');
const connection = new Sequelize('mysql://bbaaf0dc2cfc89:c187edac@us-cdbr-iron-east-01.cleardb.net/heroku_299f88593dd4e15?reconnect=true');
const UserTable = connection.define("Users", {
  email: Sequelize.STRING ,
  password: Sequelize.STRING,
  isActive: Sequelize.BOOLEAN ,
  confirmedAt: Sequelize.DATE,
  roles: Sequelize.STRING  
});
connection.sync( {
  logging: console.log
});

const UserSchema = new Mongoose.Schema({
  email: {type: String, required: true},
  password: {type: String, required: true},
  isActive: {type: Boolean},
  confirmedAt: {type: Date},
  roles: [{type: String}]
});





UserSchema.statics.AdminRole = 'admin';

UserSchema.statics.validateToken = function(token) {
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

UserSchema.statics.hashPassword = function(password, salt) {
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

UserSchema.statics.create = function(email, password, isActive = true, roles = []) {
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

UserSchema.statics.verifyUser = function(token) {
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


UserSchema.statics.assignRoles = function(userId, roles = []) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(userId);
      if (!user) return reject(new Error('User not found'));

      user.roles = Array.from(new Set([].concat(roles).contac(user.roles)));
      await user.save();

      resolve(user);
    } catch (error) {
      reject(error);
    }
  });
};

UserSchema.methods.checkPassword = function(password) {
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

UserSchema.methods.generateConfirmationToken = function() {
  return new Promise((resolve, reject) => {
    const data = {userId: this._id.toString()};
    resolve(Jwt.sign(data, Config.appKey, Config.jwtOptions));
  });
};

UserSchema.methods.hasRole = function(role) {
  return this.roles.indexOf(role) !== -1;
};

const User = Mongoose.model('User', UserSchema, 'users');

module.exports = User;
