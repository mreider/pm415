'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING
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
