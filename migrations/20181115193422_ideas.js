
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE ideas (
    id MEDIUMINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL DEFAULT '0',
    description TEXT NULL,
    popularity INT(11) NOT NULL DEFAULT '0',
    horizon DATE NULL DEFAULT NULL,
    importance VARCHAR(50) NULL DEFAULT '0',
    created_by MEDIUMINT NOT NULL DEFAULT '0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    organization_id MEDIUMINT NULL DEFAULT NULL,
    INDEX Fk_ideas_id (id),
    INDEX FK_ideas_users (created_by),
    INDEX FK_ideas_organizations (organization_id),
    CONSTRAINT FK_ideas_organizations FOREIGN KEY (organization_id) REFERENCES organizations (id),
    CONSTRAINT FK_ideas_users FOREIGN KEY (created_by) REFERENCES users (id)
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE ideas;`);
};
