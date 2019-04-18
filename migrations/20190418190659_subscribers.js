
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE subscribers (
    id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
    owner VARCHAR(50) NOT NULL COLLATE 'utf8_bin',
    subowner VARCHAR(50) COLLATE 'utf8_bin',
    owner_id MEDIUMINT NOT NULL,
    subowner_id MEDIUMINT(9),
    userid MEDIUMINT(9) NOT NULL,
    INDEX ID (id),
    INDEX user (userid),
    CONSTRAINT user FOREIGN KEY (userid) REFERENCES users (id)
  )
  ;`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE subscribers;`);
};
