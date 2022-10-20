"use strict";

import type { createRule } from "./DCIRuleHelpers";

/**
 * @fileoverview Helps you adhere to DCI conventions.
 * @author Andreas Söderlund
 */

const rules: Array<[string, "error" | "warn"]> = [
  ["literal-role-contracts", "error"],
];

const importedRules = rules.map((rule) => [
  rule[0],
  require(`./rules/${rule[0]}`).default as typeof createRule,
]);

const recommendedRules = rules.map((rule) => [`dci/${rule[0]}`, rule[1]]);

module.exports = {
  rules: Object.fromEntries(importedRules),
  configs: {
    recommended: {
      plugins: ["dci"],
      rules: Object.fromEntries(recommendedRules),
    },
  },
};
