module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:jest/recommended',
  ],
  plugins: ['react', 'jest', 'prettier'],
  parserOptions: {
    ecmaVersion: 11,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'no-console': 0,
  },
};
