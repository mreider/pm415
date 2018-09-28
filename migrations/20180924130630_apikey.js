
exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE users
    ADD COLUMN api_key VARCHAR(255)  NOT NULL AFTER updated_at;
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE users
    DROP COLUMN api_key;
  `);
};
