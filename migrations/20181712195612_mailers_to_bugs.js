exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE bugs
    ADD COLUMN mailers TEXT NULL AFTER organization_id;
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE bugs
    DROP COLUMN mailers,;
  `);
};
