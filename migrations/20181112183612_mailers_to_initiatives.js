exports.up = async function(knex) {
  return knex.raw(`
    ALTER TABLE initiatives
    ADD COLUMN mailers TEXT NULL AFTER organization_id,
    DROP COLUMN popularity;
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE initiatives
    DROP COLUMN mailers,
    ADD COLUMN popularity INT(11) NOT NULL DEFAULT '0';
  `);
};
