'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users_to_roles', {
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      }
    }).then(() => queryInterface.addConstraint('users_to_roles', ['userId'], {
      type: 'FOREIGN KEY',
      name: 'FK_users_to_roles_users_userId',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    })).then(() => queryInterface.addConstraint('users_to_roles', ['roleId'], {
      type: 'FOREIGN KEY',
      name: 'FK_users_to_roles_roles_roleId',
      references: {
        table: 'roles',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    }));
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeConstraint('users_to_roles', 'FK_users_to_roles_users_userId')
      .then(() => queryInterface.removeConstraint('users_to_roles', 'FK_users_to_roles_roles_roleId'))
      .then(() => queryInterface.dropTable('users_to_roles'));
  }
};
