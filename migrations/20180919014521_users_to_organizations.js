
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE users_organizations_roles (
    user_id           MEDIUMINT     NOT NULL,
    organization_id   MEDIUMINT     NOT NULL,
    created_at        datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at        datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, organization_id)
  );`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE users_organizations_roles;`);
};
