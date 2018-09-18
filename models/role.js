'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    role: { type: DataTypes.STRING, allowNull: false },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    //tableName: 'roles'
  });

  Role.associate = function(models) {
    Role.belongsToMany(models.User, {as: 'Users', through: 'UsersToRoles'});
    Role.belongsToMany(models.User, {as: 'OrganizationUsers', through: 'UsersOrganizationsRoles'});
    Role.belongsToMany(models.Organization, {as: 'Roles', through: 'UsersOrganizationsRoles'});
  };

  return Role;
};
