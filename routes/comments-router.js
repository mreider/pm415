const Express = require('express');
const router = Express.Router();
const knex = require('../db').knex;
const Comments = require('../models/comments');
const UORole = require('../models/users_organizations_roles');
const Role = require('../models/role');
const Item = require('../models/items');

const middlewares = require('../middlewares');
const Utils = require('../utils');
const { validate, CreateUpdateCommentSchema } = require('../validation');

const Nodemailer = require('nodemailer');
const SendGridTransport = require('nodemailer-sendgrid-transport');
const Handlebars = require('nodemailer-express-handlebars');

const Config = require('../config');

const mailer = Nodemailer.createTransport(SendGridTransport(Config.mailerConfig));
mailer.use('compile', Handlebars(Config.mailerConfig.rendererConfig));

// new comment
router.post('/new/:ownerTable/:orgId/:ownerId', [middlewares.LoginRequired, validate(CreateUpdateCommentSchema)], async function(req, res) {
  const ownerId = parseInt(req.params.ownerId);
  const orgId = parseInt(req.params.orgId);
  const ownerTable = req.params.ownerTable;
  let data = req.body;

  if (JSON.stringify(data) === '{}') return res.boom.conflict('Conflict', { success: false, message: 'No data to create new backlog' });

  data.organization_id = orgId;
  data.created_by = req.user.id;
  data.ownerId = ownerId;
  data.ownerTable = ownerTable;
  let haveOwner = false;
  try {
    let rows = await knex(ownerTable).count().where({ organization_id: orgId, id: ownerId });
    let count = rows[0]['count(*)'];
    if (count === 1) haveOwner = true;
  } catch (error) {
    haveOwner = false;
  }
  if (!haveOwner) return res.boom.notFound('Not found', { success: false, message: `Owner not found.` });

  let mailers = '';
  if (data.mailers) {
    data.mailers.forEach(el => {
      mailers = mailers + '!' + el + '!';
    });
  };
  data.mailers = mailers;

  const comment = await Comments.create(data);

  sendNotice(Utils.serialize(comment));

  res.json({ success: true, comment });
});

// get comments
router.get('/get/:ownerTable/:orgId/:ownerId', middlewares.LoginRequired, async function(req, res) {
  const organizationId = parseInt(req.params.orgId);
  const ownerTable = req.params.ownerTable;
  const ownerId = parseInt(req.params.ownerId);
  let comments = [];
  try {
    comments = await Comments.where({ organization_id: organizationId, owner_table: ownerTable, owner_id: ownerId }).fetchAll();
  } catch (error) {
    return res.boom.notFound('Not found', { success: false, message: `Comments not found.` });
  };
  res.json({ success: true, comments });
});

// edit comment
router.put('/edit/:id', [middlewares.LoginRequired, validate(CreateUpdateCommentSchema)], async function(req, res) {
  const id = parseInt(req.params.id);
  let data = req.body;

  const comment = await Comments.where({ id: id }).fetch();
  if (!comment) return res.boom.notFound('Not found', { success: false, message: `Comments not found.` });

  let mailers = '';
  if (data.mailers) {
    data.mailers.forEach(el => {
      mailers = mailers + '!' + el + '!';
    });
  };
  data.mailers = mailers;

  comment.set(data);
  await comment.save();

  sendNotice(Utils.serialize(comment));

  res.json({ success: true, comment });
});

// delete comment
router.delete('/delete/:orgId/:id', [middlewares.LoginRequired], async function(req, res) {
  const orgId = parseInt(req.params.orgId);
  const id = parseInt(req.params.id);

  const isAdmin = await UORole.where({ organization_id: orgId, user_id: req.user.id, role_id: Role.AdminRoleId }).fetch();

  const comment = await Comments.where('id', '=', id).fetch();
  if (comment) {
    if (comment.get('createdBy') !== req.user.id && !isAdmin) return res.boom.forbidden('Forbidden', { success: false, message: 'Only admin or owner can delete comment' });
  } else {
    return res.boom.forbidden('Forbidden', { success: false, message: 'backlog not found' });
  };
  await comment.destroy();

  res.json({ success: true, comment: id, message: 'Comment deleted' });
});

function sendMail(value) {
  var mail = {
    from: Config.mailerConfig.from,
    to: value.email,
    subject: value.subject,
    template: 'comment',
    context: {
      href: value.href
    }
  };
  mailer.sendMail(mail);
};

async function sendNotice(ncomment) {
  let url = '';
  let subject = '';
  if (ncomment.ownerTable === 'items') {
    url = Config.siteUrl + 'items/item/?orgId=' + ncomment.organizationId + '&itemId=' + ncomment.ownerId;
    subject = 'item updated';
  } else if (ncomment.ownerTable === 'initiatives') {
    url = Config.siteUrl + 'initiative/?orgId=' + ncomment.organizationId + '&initiativeid=' + ncomment.ownerId;
    subject = 'initiative updated';
  };

  const mailersWhoNeedSendMail = await Item.getAllBacklogMailers(ncomment.ownerId, ncomment.ownerTable);

  if (!ncomment.organizationId) ncomment.organizationId = ncomment.organization_id;

  mailersWhoNeedSendMail.forEach(el => {
    let value = {};
    value.href = url;
    value.email = el;
    value.subject = subject;
    sendMail(value);
  });
}

module.exports = router;
