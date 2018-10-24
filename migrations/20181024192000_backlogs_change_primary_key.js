
exports.up = function(knex, Promise) {
  return knex.raw(`
  ALTER TABLE backlogs
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (created_by, organization_id, id);
  `);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
  ALTER TABLE backlogs
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (created_by, organization_id, status_id);
  `);
};
