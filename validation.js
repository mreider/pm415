const Joi = require('joi');

const validate = (schema, source) => {
  return function(req, res, next) {
    if (!source) source = (request, response) => { return request.body; };

    Joi.validate(source(req, res), schema, {abortEarly: true}, function(err, validationResult) {
      if (err) {
        let details = err.details.map(detail => {
          return detail.message;
        });

        return res.boom.badRequest(details, {success: false});
      }

      req.schema = schema;
      return next();
    });
  };
};

const LoginSchema = {
  email: Joi.string().required().label('Email'),
  password: Joi.string().required().label('Password')
};

const RegisterSchema = {
  email: Joi.string().email().required().label('Email'),
  password: Joi.string().required().label('Password'),
  firstName: Joi.string().required().label('First Name'),
  lastName: Joi.string().required().label('Last Name'),
  confirmation: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation'),
  organization: Joi.string().optional().label('Organization')
};

const VerifySchema = {
  token: Joi.string().required()
};

module.exports = {
  validate: validate,
  LoginSchema,
  RegisterSchema,
  VerifySchema
};
