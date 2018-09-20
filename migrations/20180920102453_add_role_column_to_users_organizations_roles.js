exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE users_organizations_roles
    ADD COLUMN role_id MEDIUMINT NOT NULL AFTER organization_id;
  `);
};

exports.down = async function(knex) {
  return knex.raw(`
    ALTER TABLE users_organizations_roles
    DROP COLUMN role_id;
  `);
};
