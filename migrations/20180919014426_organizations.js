
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE organizations (
    id                int(11)       NOT NULL AUTO_INCREMENT,
    name              varchar(255)  NOT NULL,
    created_at        datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    updated_at        datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
  );`);
};

exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE organizations;`);
};
