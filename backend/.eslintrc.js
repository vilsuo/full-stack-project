module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 15,
  },
  plugins: [
    'react',
    'jest',
  ],
  rules: {
    'linebreak-style': 0,
    'no-console': 0,
  },
};
