
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE votes (
    id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
    user_id MEDIUMINT(9) NOT NULL DEFAULT '0',
    vote MEDIUMINT(9) NOT NULL DEFAULT '0',
    owner_table VARCHAR(50) NOT NULL DEFAULT '0' COLLATE 'utf8_bin',
    owner_id MEDIUMINT(9) NOT NULL DEFAULT '0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE INDEX FK_votes_users (user_id, owner_table, owner_id),
    INDEX Id (id),
    CONSTRAINT FK_votes_users FOREIGN KEY (user_id) REFERENCES users (id)
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE votes;`);
};
