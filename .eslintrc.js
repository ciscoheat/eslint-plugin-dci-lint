"use strict";

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    "eslint:recommended",
    //"plugin:node/recommended",
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    node: true,
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-var-requires": "off"
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      env: { mocha: true }
    },
  ],
};
