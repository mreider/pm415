'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('users_to_roles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      roleId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }).then(() => queryInterface.addConstraint('users_to_roles', ['userId'], {
      type: 'FOREIGN KEY',
      name: 'FK_user_userId',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    })).then(() => queryInterface.addConstraint('users_to_roles', ['roleId'], {
      type: 'FOREIGN KEY',
      name: 'FK_role_roleId',
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
      .removeConstraint('users_to_roles', 'FK_user_userId')
      .then(() => queryInterface.removeConstraint('users_to_roles', 'FK_role_roleId'))
      .then(() => queryInterface.dropTable('users_to_roles'));
  }
};
