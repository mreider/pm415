module.exports = {
  development: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql'
  },
  test: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql'
  },
  production: {
    use_env_variable: 'CLEARDB_DATABASE_URL',
    dialect: 'mysql'
  }
};
