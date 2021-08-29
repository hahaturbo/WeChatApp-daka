module.exports = {
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: 'eslint:recommended',
  plugins: ['@typescript-eslint'],
  rules: {},
  globals: {
    App: 'readonly',
    Component: 'readonly',
    Page: 'readonly',
    wx: 'readonly',
    getApp: 'readonly',
    getCurrentPages: 'readonly',
  },
};
