const Logger = require('../logger');

module.exports = function(err, req, res, next) {
  Logger.error(err);
  console.error(err, err.stack);
  return res.boom.badImplementation(err.toString(), { success: false, message: err.message });
};
