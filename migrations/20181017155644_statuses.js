
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE statuses (
    owner_table        VARCHAR(50)   NOT NULL,
    organization_id    MEDIUMINT     DEFAULT '0',
    id                 MEDIUMINT     NOT NULL,
    name               VARCHAR(50)  NOT NULL,
    created_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (owner_table, id)
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE statuses;`);
};
