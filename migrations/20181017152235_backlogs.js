
exports.up = function(knex, Promise) {
  return knex.raw(`CREATE TABLE backlogs (
    assignee           MEDIUMINT     NOT NULL,
    organization_id    MEDIUMINT     NOT NULL,
    id                 MEDIUMINT     NOT NULL,
    title              VARCHAR(255)  NOT NULL,
    description        TEXT          DEFAULT NULL,
    status_id          MEDIUMINT     NOT NULL,
    points             VARCHAR(50)   DEFAULT NULL,
    deleted            TINYINT(1)    DEFAULT '0',
    created_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    created_by         MEDIUMINT     NOT NULL,
    updated_at         DATETIME      NOT NULL  DEFAULT CURRENT_TIMESTAMP,
    forecasted_release DATETIME,
    actual_release     DATETIME,
    planned_on         DATETIME,
    PRIMARY KEY (created_by, organization_id, id, status_id)
  );`);
};
exports.down = function(knex, Promise) {
  return knex.raw(`DROP TABLE backlogs;`);
};
