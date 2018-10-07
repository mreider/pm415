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
  password: Joi.string().required().label('Password'),
  firstName: Joi.string().required().label('First Name'),
  lastName: Joi.string().required().label('Last Name'),
  confirmation: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation'),
  tosAccepted: Joi.boolean().required().valid('Y').options({ language: { any: { allowOnly: 'must be accepted' } } }).label('Terms of Service'),
  organization: Joi.string().optional().label('Organization')
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
  name: Joi.string().min(2).required().label('Name'),
  organizationId: Joi.string().required().label('organizationId')
};
const InviteLinkSchema = {
  name: Joi.string().min(2).required().label('Name'),
  email: Joi.string().email().required().label('Email')
};
const ChangePasswordSchema = {
  token: Joi.string().required().label('token'),
  password: Joi.string().required().label('Password'),
  confirmation: Joi.string().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } }).label('Confirmation')
};
const DeleteOrgSchema = {
  userId: Joi.string().required().label('userId'),
  organizationId: Joi.string().required().label('organizationId')
};
const UpdateUserSchema = {
  firstName: Joi.string().min(0).allow('').optional().label('Firstname'),
  lastName: Joi.string().optional().label('Lastname'),
  email: Joi.string().required().label('Email'),
  password: Joi.string().required(),
  confirmation: Joi.string().required()
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
  DeleteOrgSchema,
  UpdateOrganizationSchema
};
