
exports.up = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE users_organizations_roles
    ADD COLUMN role_id MEDIUMINT NOT NULL AFTER organization_id;
  `).then(() => knex.raw(`
    ALTER TABLE users_organizations_roles
    ADD CONSTRAINT FK__users_organizations_roles__roles__id
    FOREIGN KEY (role_id)
    REFERENCES roles(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE users_organizations_roles
    ADD CONSTRAINT FK__users_organizations_roles__users__id
    FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE users_organizations_roles
    ADD CONSTRAINT FK__users_organizations_roles__organizations__id
    FOREIGN KEY (organization_id)
    REFERENCES users(id) ON DELETE CASCADE;
  `)).then(() => knex.raw(`
    ALTER TABLE users_organizations_roles
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (user_id, organization_id, role_id);
  `));
};

exports.down = function(knex, Promise) {
  return knex.raw(`
    ALTER TABLE users_organizations_roles
    DROP PRIMARY KEY,
    ADD PRIMARY KEY (user_id, organization_id);
  `).then(() => {
    return knex.raw(`
      ALTER TABLE users_organizations_roles
      DROP FOREIGN KEY FK__users_organizations_roles__organizations__id;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__users_organizations_roles__organizations__id" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE users_organizations_roles
      DROP FOREIGN KEY FK__users_organizations_roles__users__id;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__users_organizations_roles__users__id" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE users_organizations_roles
      DROP FOREIGN KEY FK__users_organizations_roles__roles__id;
    `);
  }).catch(() => {
    console.log(`Foreign key "FK__users_organizations_roles__roles__id" does not exists and cannot be removed`);
  }).then(() => {
    return knex.raw(`
      ALTER TABLE users_organizations_roles
      DROP COLUMN role_id;
    `);
  });
};
