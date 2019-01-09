exports.up = async function(knex) {
  return knex.raw(`
  ALTER TABLE backlogs
  ADD COLUMN archived TINYINT NOT NULL DEFAULT '0' AFTER planned_on;
  `).then(() => knex.raw(`
  ALTER TABLE bugs
  ADD COLUMN archived TINYINT NOT NULL DEFAULT '0' AFTER updated_at;
  `)).then(() => knex.raw(`
  ALTER TABLE initiatives
  ADD COLUMN archived TINYINT NULL DEFAULT '0' AFTER mailers;
  `)).then(() => knex.raw(`
  ALTER TABLE items
  ADD COLUMN archived TINYINT NULL DEFAULT '0' AFTER mailers;
  `));
};
exports.down = function(knex, Promise) {
  return knex.raw(`
     ALTER TABLE backlogs
    DROP COLUMN archived;
    `).then(() => knex.raw(`
    ALTER TABLE bugs
    DROP COLUMN archived;
    `)).then(() => knex.raw(`
    ALTER TABLE initiatives
    DROP COLUMN archived;
    `)).then(() => knex.raw(`
    ALTER TABLE items
    DROP COLUMN archived;
  `));
};
