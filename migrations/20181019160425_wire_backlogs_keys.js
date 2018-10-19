
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE backlogs
    ADD CONSTRAINT FK_backlogs_users
    FOREIGN KEY (assignee)
    REFERENCES users(id) ON DELETE CASCADE;
  `).then(() => knex.raw(`
    ALTER TABLE statuses
    CHANGE COLUMN id id MEDIUMINT(9) NOT NULL AUTO_INCREMENT AFTER organization_id,
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (id);
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    ADD CONSTRAINT FK__backlogs_organization
    FOREIGN KEY (organization_id)
    REFERENCES organizations(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    ADD CONSTRAINT FK__backlogs_status
    FOREIGN KEY (status_id)
    REFERENCES statuses(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    ADD CONSTRAINT FK__backlogs_createdBy
    FOREIGN KEY (created_by)
    REFERENCES users(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    DROP COLUMN deleted;
  `)).then(() => knex.raw(`
    ALTER TABLE statuses
    CHANGE COLUMN name name VARCHAR(50) NOT NULL COLLATE 'utf8_bin' FIRST;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    CHANGE COLUMN points points MEDIUMINT NULL DEFAULT 0 COLLATE 'utf8_bin' AFTER status_id;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    ALTER assignee DROP DEFAULT;
  `)).then(() => knex.raw(`
    ALTER TABLE backlogs
    CHANGE COLUMN assignee assignee MEDIUMINT(9) NULL FIRST;
  `));
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE backlogs
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (id, organization_id, created_by, assignee);
  `).then(() => {
    return knex.raw(`
      ALTER TABLE backlogs
      DROP FOREIGN KEY FK_backlogs_users;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK_backlogs_users" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE backlogs
      DROP FOREIGN KEY FK__backlogs_organization;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__backlogs_organization" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE backlogs
      DROP FOREIGN KEY FK__backlogs_status;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__backlogs_status" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE backlogs
      DROP FOREIGN KEY FK__backlogs_createdBy;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__backlogs_createdBy" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
    ALTER TABLE backlogs
    ADD COLUMN deleted TINYINT(1)    DEFAULT '0';)
    `);
  }).catch(() => {
    console.log(`can nod add column deleted`);
  });
};
