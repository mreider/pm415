
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE connections (
    id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
    initiative_id MEDIUMINT(9) NULL DEFAULT NULL,
    backlog_id MEDIUMINT(9) NULL DEFAULT NULL,
    item_id MEDIUMINT(9) NULL DEFAULT NULL,
    INDEX id (id),
    INDEX FK_сonnections_initiatives (initiative_id),
    INDEX FK_сonnections_backlogs (backlog_id),
    INDEX FK_сonnections_items (item_id),
    CONSTRAINT FK_сonnections_backlogs FOREIGN KEY (backlog_id) REFERENCES backlogs (id),
    CONSTRAINT FK_сonnections_initiatives FOREIGN KEY (initiative_id) REFERENCES initiatives (id),
    CONSTRAINT FK_сonnections_items FOREIGN KEY (item_id) REFERENCES items (id)
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE connections;`);
};
