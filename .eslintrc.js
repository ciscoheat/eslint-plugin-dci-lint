"use strict";

module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    //"plugin:node/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:dci-lint/recommended",
  ],
  env: {
    node: true,
  },
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "dci-lint/literal-role-contracts": "error",
    //"dci-lint/no-this-in-context": "off",
  },
  overrides: [
    {
      files: ["tests/**/*.js"],
      env: { mocha: true },
    },
  ],
};
