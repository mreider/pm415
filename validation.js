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
  password: Joi.string().required().label('Password'),
  token: Joi.string().optional()
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

const BackLogsSelectSchema = {
  backlogsId: Joi.array().required().label('backlogsId'),
  fullSelect: Joi.boolean().required().label('fullSelect')
};

const InitiativesSelectSchema = {
  initiativeId: Joi.array().required().label('initiativeId'),
  fullSelect: Joi.boolean().required().label('fullSelect')
};

const BugsSelectSchema = {
  bugId: Joi.array().required().label('bugId'),
  fullSelect: Joi.boolean().required().label('fullSelect')
};

const UpdateBacklogSchema = {
  assignee: Joi.string().min(1).optional().label('Assignee'),
  organizationId: Joi.string().optional().label('OrganizationId'),
  title: Joi.string().optional().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  points: Joi.string().optional().label('Points'),
  forecastedRelease: Joi.date().optional(),
  actualRelease: Joi.date().optional(),
  plannedOn: Joi.date().optional(),
  archived: Joi.boolean().optional().label('Archived')
};

const UpdateInitiativesSchema = {
  organizationId: Joi.string().optional().label('OrganizationId'),
  title: Joi.string().optional().label('Title'),
  description: Joi.string().optional().label('Description'),
  popularity: Joi.string().optional().label('Popularity'),
  horizon: Joi.string().optional().label('Horizon'),
  statusId: Joi.string().optional().label('Status is'),
  mailers: Joi.string().optional().label('Mailers'),
  archived: Joi.boolean().optional().label('Archived')
};
const UpdateBugsSchema = {
  assignee: Joi.string().min(1).optional().label('Assignee'),
  title: Joi.string().required().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  severity: Joi.string().optional().label('Severity'),
  createdBy: Joi.string().min(1).optional().label('Created By'),
  mailers: Joi.string().optional().label('Mailers'),
  archived: Joi.boolean().optional().label('Archived')
};

const CreateInitiativesSchema = {
  title: Joi.string().required().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  popularity: Joi.string().optional().label('Popularity'),
  horizon: Joi.string().optional().label('Horizon'),
  mailers: Joi.string().optional().label('Mailers')
};

const CreateBacklogSchema = {
  assignee: Joi.string().min(1).optional().label('Assignee'),
  title: Joi.string().required().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  points: Joi.string().optional().label('Points'),
  forecastedRelease: Joi.date().optional(),
  actualRelease: Joi.date().optional(),
  plannedOn: Joi.date().optional()
};

const CreateBugsSchema = {
  assignee: Joi.string().min(1).optional().label('Assignee'),
  title: Joi.string().required().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  severity: Joi.string().optional().label('Severity'),
  createdBy: Joi.string().min(1).optional().label('Created by'),
  mailers: Joi.string().optional().label('Mailers')
};

const ItemSelectSchema = {
  itemsId: Joi.array().required().label('itemsId'),
  fullSelect: Joi.boolean().required().label('fullSelect')
};

const UpdateItemSchema = {
  assignee: Joi.string().min(1).optional().label('Assignee'),
  organizationId: Joi.string().optional().label('OrganizationId'),
  title: Joi.string().optional().label('Title'),
  description: Joi.string().optional().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  points: Joi.string().optional().label('Points'),
  forecastedRelease: Joi.date().optional(),
  actualRelease: Joi.date().optional(),
  plannedOn: Joi.date().optional(),
  mailers: Joi.string().optional().label('Mailers'),
  archived: Joi.boolean().optional().label('Archived'),
  order_index: Joi.string().min(1).optional().label('order_index')
};

const CreateItemSchema = {
  ownerTable: Joi.string().required().min(1).label('Owner table'),
  ownerId: Joi.string().required().min(1).label('Owner id'),
  assignee: Joi.string().min(1).optional().label('Assignee'),
  title: Joi.string().required().label('Title'),
  description: Joi.string().required().label('Description'),
  statusId: Joi.string().optional().label('Status id'),
  points: Joi.string().optional().label('Points'),
  forecastedRelease: Joi.date().optional(),
  actualRelease: Joi.date().optional(),
  plannedOn: Joi.date().optional(),
  mailers: Joi.string().optional().label('Mailers'),
  order_index: Joi.string().min(1).optional().label('order_index')
};

const CreateUpdateCommentSchema = {
  comment: Joi.string().min(1).required().label('Comment'),
  mailers: Joi.array().optional().label('Mailers')
};

const CreateUpdateDeleteConnectionsSchema = {
  items: Joi.array().required().label('items'),
  backlogs: Joi.array().required().label('backlogs'),
  initiatives: Joi.array().required().label('initiatives'),
  bugs: Joi.array().required().label('bugs'),
  delete: Joi.boolean().required().label('delete')
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
  UpdateOrganizationSchema,
  BackLogsSelectSchema,
  UpdateBacklogSchema,
  CreateBacklogSchema,
  CreateUpdateCommentSchema,
  CreateItemSchema,
  UpdateItemSchema,
  ItemSelectSchema,
  InitiativesSelectSchema,
  UpdateInitiativesSchema,
  CreateInitiativesSchema,
  CreateUpdateDeleteConnectionsSchema,
  BugsSelectSchema,
  UpdateBugsSchema,
  CreateBugsSchema
};
