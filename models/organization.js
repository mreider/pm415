'use strict';

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {
    //tableName: 'organizations'
  });

  Organization.associate = function(models) {
    Organization.belongsToMany(models.User, {as: 'Members', through: 'UsersOrganizationsRoles'});
    Organization.belongsToMany(models.Role, {as: 'Roles', through: 'UsersOrganizationsRoles'});
  };

  return Organization;
};
