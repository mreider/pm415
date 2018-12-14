
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE bugs (
    id MEDIUMINT(9) NOT NULL AUTO_INCREMENT,
    assignee MEDIUMINT(9) NULL DEFAULT NULL,
    organization_id MEDIUMINT(9) NOT NULL,
    title VARCHAR(255) NOT NULL COLLATE 'utf8_bin',
    description TEXT NULL COLLATE 'utf8_bin',
    status_id MEDIUMINT(9) NULL DEFAULT NULL,
    severity VARCHAR(50) NULL DEFAULT 'P2' COLLATE 'utf8_bin',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by MEDIUMINT(9) NOT NULL,
    reported_by MEDIUMINT(9) NULL DEFAULT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (created_by, organization_id, id),
    INDEX FK_bugs_users (reported_by),
    INDEX FK_bugs_created_by (created_by),
    INDEX FK__bugs_organization (organization_id),
    INDEX FK__bugs_status (status_id),
    INDEX FK__bugs_assignee (assignee),
    INDEX id (id),
    CONSTRAINT FK__bugs_createdBy FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT FK__bugs_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    CONSTRAINT FK__bugs_status FOREIGN KEY (status_id) REFERENCES statuses (id) ON DELETE CASCADE,
    CONSTRAINT FK_bugs_assignee FOREIGN KEY (assignee) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT FK_bugs_users FOREIGN KEY (reported_by) REFERENCES users (id) ON DELETE CASCADE
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE bugs;`);
};
