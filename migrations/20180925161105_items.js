
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE items (
    assignee MEDIUMINT NULL DEFAULT NULL,
    organization_id MEDIUMINT NOT NULL,
    id MEDIUMINT NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL ,
    description TEXT NULL ,
    status_id MEDIUMINT NOT NULL DEFAULT '1',
    points MEDIUMINT NULL DEFAULT '0',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by MEDIUMINT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forecasted_release DATETIME NULL DEFAULT NULL,
    actual_release DATETIME NULL DEFAULT NULL,
    planned_on DATETIME NULL DEFAULT NULL,
    owner_id MEDIUMINT NOT NULL DEFAULT '1',
    owner_table        VARCHAR(50)   NOT NULL,
    PRIMARY KEY (created_by, organization_id, id),
    INDEX FK_items_users (assignee),
    INDEX FK__items_organization (organization_id),
    INDEX FK__items_status (status_id),
    INDEX id (id),
    CONSTRAINT FK__items_createdBy FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT FK__items_organization FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    CONSTRAINT FK__items_status FOREIGN KEY (status_id) REFERENCES statuses (id) ON DELETE CASCADE,
    CONSTRAINT FK_items_users FOREIGN KEY (assignee) REFERENCES users (id) ON DELETE CASCADE
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE items;`);
};
