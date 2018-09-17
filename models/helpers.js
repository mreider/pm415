module.exports = exports = {};

exports.toUnderscoreCase = (str) => {
  return str.replace(/([A-Z])/g, function($1) { return '_' + $1.toLowerCase(); });
};

exports.isObject = (obj) => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

exports.isFunction = (func) => {
  return Object.prototype.toString.call(func) === '[object Function]';
};

exports.fixFields = (fieldsObject) => {
  Object.keys(fieldsObject).map(key => {
    if (!fieldsObject[key].field) {
      const fieldName = exports.toUnderscoreCase(key);

      if (exports.isFunction(fieldsObject[key])) {
        fieldsObject[key] = {type: fieldsObject[key]};
      }

      fieldsObject[key].field = fieldName;
    }
  });

  return fieldsObject;
};
