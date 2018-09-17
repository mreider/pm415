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
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      role_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }).then(() => queryInterface.addConstraint('users_to_roles', ['user_id'], {
      type: 'FOREIGN KEY',
      name: 'FK_user_user_id',
      references: {
        table: 'users',
        field: 'id'
      },
      onDelete: 'no action',
      onUpdate: 'no action'
    })).then(() => queryInterface.addConstraint('users_to_roles', ['role_id'], {
      type: 'FOREIGN KEY',
      name: 'FK_role_role_id',
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
      .removeConstraint('users_to_roles', 'FK_user_user_id')
      .then(() => queryInterface.removeConstraint('users_to_roles', 'FK_role_role_id'))
      .then(() => queryInterface.dropTable('users_to_roles'));
  }
};
