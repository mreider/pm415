const Joi = require('joi');

const validate = (schema, source) => {
  return function(req, res, next) {
    if (!source) source = (request, response) => { return request.body; };

    Joi.validate(source(req, res), schema, { abortEarly: true }, function(err, validationResult) {
      if (err) {
        let details = err.details.map(detail => {
          return detail.message;
        });

        return res.boom.badRequest(details, { success: false });
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
  password: Joi.string().min(4).required().label('Password'),
  firstName: Joi.string().required().label('First Name'),
  lastName: Joi.string().required().label('Last Name'),
  confirmation: Joi.string().min(4).valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation'),
  tosAccepted: Joi.boolean().required().valid('Y').options({ language: { any: { allowOnly: 'must be accepted' } } }).label('Terms of Service'),
  organization: Joi.string().optional().label('Organization'),
  token: Joi.string().optional()
};

const VerifySchema = {
  token: Joi.string().required()
};

const ForgotPasswordSchema = {
  email: Joi.string().email().required().label('Email')
};

const NewOrganizationSchema = {
  name: Joi.string().min(2).required().label('Name')
};

const UpdateOrganizationSchema = {
  name: Joi.string().min(2).required().label('Name')
};

const InviteLinkSchema = {
  email: Joi.string().email().required().label('Email'),
  send: Joi.boolean().optional().default(false)
};

const ChangePasswordSchema = {
  token: Joi.string().required().label('token'),
  password: Joi.string().min(4).required().label('Password'),
  confirmation: Joi.string().min(4).valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation')
};

const UpdateUserSchema = {
  firstName: Joi.string().min(0).allow('').optional().label('Firstname'),
  lastName: Joi.string().optional().label('Lastname'),
  email: Joi.string().required().label('Email'),
  password: Joi.string().min(4).optional(),
  confirmation: Joi.string().min(4).valid(Joi.ref('password')).optional().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation')
};

module.exports = {
  validate: validate,
  LoginSchema,
  RegisterSchema,
  VerifySchema,
  ForgotPasswordSchema,
  ChangePasswordSchema,
  UpdateUserSchema,
  NewOrganizationSchema,
  InviteLinkSchema,
  UpdateOrganizationSchema
};
