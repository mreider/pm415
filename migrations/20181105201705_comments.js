
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE comments (
    id                 MEDIUMINT     NOT NULL AUTO_INCREMENT,
    owner_id           MEDIUMINT     NOT NULL,
    owner_table        VARCHAR(50)   NOT NULL,
    comment            TEXT          DEFAULT NULL,
    created_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    created_by         MEDIUMINT     NOT NULL,
    updated_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    organization_id    MEDIUMINT     NOT NULL,
    PRIMARY KEY (id)
  );`).then(() => knex.raw(`
  ALTER TABLE comments
  ADD CONSTRAINT created_by_fk FOREIGN KEY (created_by) REFERENCES users (id);
  `));
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE comments;`);
};
