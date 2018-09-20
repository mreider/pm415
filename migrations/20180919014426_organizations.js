
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE organizations (
    id                MEDIUMINT     NOT NULL AUTO_INCREMENT,
    name              VARCHAR(255)  NOT NULL,
    created_at        DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE organizations;`);
};
