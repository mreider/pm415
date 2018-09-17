'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role: { type: DataTypes.STRING, allowNull: false },
    createdAt: { field: 'created_at', type: DataTypes.DATE },
    updatedAt: { field: 'updated_at', type: DataTypes.DATE }
  }, {});

  Role.associate = function(models) {
    Role.belongsToMany(models.User, {
      through: 'users_to_roles',
      onDelete: 'CASCADE',
      foreignKey: { allowNull: false }
    });
  };

  return Role;
};
