exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE users
    DROP COLUMN api_key;`).then(() => knex.raw(`
    ALTER TABLE users
    ADD COLUMN api_key VARCHAR(255)  DEFAULT NULL AFTER updated_at;
  `));
};

exports.down = async function(knex) {
  return knex.raw(``);
};
