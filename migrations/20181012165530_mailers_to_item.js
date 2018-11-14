exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE items
    ADD COLUMN mailers TEXT NULL AFTER owner_table;
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE items
    DROP COLUMN mailers;
  `);
};
