
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE users (
    id                MEDIUMINT     NOT NULL AUTO_INCREMENT,
    email             VARCHAR(255)  NOT NULL,
    password          VARCHAR(384)  NOT NULL,
    first_name        VARCHAR(255)  DEFAULT NULL,
    last_name         VARCHAR(255)  DEFAULT NULL,
    is_active         TINYINT(1)    DEFAULT '0',
    confirmed_at      DATETIME      DEFAULT NULL,
    created_at        DATETIME      NOT NULL      DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME      NOT NULL      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE users;`);
};
