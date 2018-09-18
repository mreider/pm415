'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role: { type: DataTypes.STRING, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    tableName: 'roles'
  });

  Role.associate = function(models) {
    Role.belongsToMany(models.User, {
      as: 'Users',
      through: 'users_to_roles',
      onDelete: 'CASCADE',
      foreignKey: { allowNull: false }
    });
  };

  return Role;
};
