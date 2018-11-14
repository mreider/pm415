exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE comments
    ADD COLUMN mailers TEXT NULL AFTER owner_table;
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE comments
    DROP COLUMN mailers;
  `);
};
