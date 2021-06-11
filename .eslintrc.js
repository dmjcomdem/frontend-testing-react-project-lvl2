module.exports = {
  plugins: ['jest'],
  env: {
    node: true,
    es2020: true,
  },
  extends: ['airbnb-base', 'plugin:jest/recommended'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
  },
  rules: {
    'no-console': 0,
  },
};
