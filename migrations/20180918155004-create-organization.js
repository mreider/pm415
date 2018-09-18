'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('organizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => queryInterface.createTable('users_to_organizations', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      organizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      }
    })).then(() => queryInterface.addConstraint('users_to_organizations', ['userId'], {
      type: 'FOREIGN KEY',
      name: 'FK_users_to_organizations_user_userId',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    })).then(() => queryInterface.addConstraint('users_to_organizations', ['organizationId'], {
      type: 'FOREIGN KEY',
      name: 'FK_users_to_organizations_organizations_organizationId',
      references: {
        table: 'organizations',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeConstraint('users_to_roles', 'FK_users_to_organizations_user_userId')
      .then(() => queryInterface.removeConstraint('users_to_roles', 'FK_users_to_organizations_organizations_organizationId'))
      .then(() => queryInterface.dropTable('users_to_organizations'))
      .then(() => queryInterface.dropTable('organizations'));
  }
};
