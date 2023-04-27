"use strict";

import type { createRule } from "./DCIRuleHelpers";

/**
 * @fileoverview Helps you adhere to DCI conventions.
 * @author Andreas Söderlund
 */

const rules: Array<[string, "error" | "warn" | "off"]> = [
  ["grouped-rolemethods", "error"],
  ["no-this-in-context", "error"],
  ["private-role-access", "error"],
  ["atomic-role-binding", "error"],

  ["literal-role-contracts", "warn"],

  ["immutable-roles", "off"],
  ["sorted-rolemethods", "off"],
];

const importedRules = rules.map((rule) => [
  rule[0],
  require(`./rules/${rule[0]}`).default as typeof createRule,
]);

const recommendedRules = rules.map((rule) => [`dci-lint/${rule[0]}`, rule[1]]);

module.exports = {
  rules: Object.fromEntries(importedRules),
  configs: {
    recommended: {
      plugins: ["dci-lint"],
      rules: {
        ...Object.fromEntries(recommendedRules),
      },
    },
  },
};
