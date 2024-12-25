import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPlugin from "eslint-plugin-eslint-plugin";
import dciLint from "./lib/index.js";

export default tseslint.config(
  {
    // Project service ignores
    ignores: ["eslint.config.mjs", "**/*.js", "tests/tests.mjs"],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  eslintPlugin.configs["flat/recommended"],
  dciLint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["tests/*.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: "module",
    },
  },
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-var-requires": "off",
      "dci-lint/literal-role-contracts": "error",
    },
  }
);
