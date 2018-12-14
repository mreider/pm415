
exports.up = function(knex, Promise) {
  return knex.raw(`ALTER TABLE connections
  ADD COLUMN bug_id MEDIUMINT NULL DEFAULT NULL AFTER item_id,
  ADD INDEX FK_connections_bugs (bug_id),
  ADD CONSTRAINT FK_connections_bugs FOREIGN KEY (bug_id) REFERENCES bugs (id);
`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`ALTER TABLE connections
  DROP COLUMN bug_id,
  DROP INDEX FK_connections_bugs,
  DROP FOREIGN KEY FK_connections_bugs;`);
};
