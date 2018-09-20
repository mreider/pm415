
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE users (
    id                MEDIUMINT     NOT NULL AUTO_INCREMENT,
    email             varchar(255)  NOT NULL,
    password          varchar(384)  NOT NULL,
    first_name        varchar(255)  DEFAULT NULL,
    last_name         varchar(255)  DEFAULT NULL,
    is_active         tinyint(1)    DEFAULT '0',
    confirmed_at      datetime      DEFAULT NULL,
    created_at        datetime      NOT NULL      DEFAULT CURRENT_TIMESTAMP,
    updated_at        datetime      NOT NULL      DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE users;`);
};
