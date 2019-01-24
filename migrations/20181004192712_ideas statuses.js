
exports.up = function(knex, Promise) {
  return knex.raw(`
  ALTER TABLE initiatives
  ADD COLUMN status_id MEDIUMINT NOT NULL DEFAULT '12' AFTER horizon,
  DROP COLUMN importance,
  ADD CONSTRAINT FK_ideas_statuses FOREIGN KEY (status_id) REFERENCES statuses (id);`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`
  ALTER TABLE initiatives
  ADD COLUMN importance VARCHAR(50) NULL DEFAULT '0' AFTER created_by,
  DROP COLUMN status_id,
  DROP FOREIGN KEY FK_ideas_statuses;`);
};
