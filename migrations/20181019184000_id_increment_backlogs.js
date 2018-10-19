
exports.up = function(knex, Promise) {
  return knex.raw(`
  ALTER TABLE backlogs
  CHANGE COLUMN id id MEDIUMINT(9) NOT NULL AUTO_INCREMENT AFTER organization_id,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (created_by, organization_id, status_id),
  ADD INDEX id (id),
  CHANGE COLUMN status_id status_id MEDIUMINT(9) NOT NULL DEFAULT '1' AFTER description;
  `);
};
exports.down = function(knex, Promise) {
  // return knex.raw(`DROP TABLE statuses;`);
};
