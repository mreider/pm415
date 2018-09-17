module.exports = {
  development: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql',
    underscored: true
  },
  test: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql',
    underscored: true
  },
  production: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql',
    underscored: true
  }
};
