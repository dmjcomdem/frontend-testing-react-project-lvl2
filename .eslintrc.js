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
    },
    rules: {
        'no-console': 0,
        indent: ['error', 4],
    },
};
