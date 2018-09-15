// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  // parserOptions: {
  //   parser: 'babel-eslint'
  // },
  env: {
    browser: true,
  },
  extends: [
    'standard'
  ],
  plugins: [
  ],
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'semi': [1, 'always'],
    'space-before-function-paren': 'off'
  }
}
