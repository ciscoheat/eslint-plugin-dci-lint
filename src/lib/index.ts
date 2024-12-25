import fs from "fs";

/**
 * @fileoverview Helps you adhere to DCI conventions.
 * @author Andreas Söderlund
 */

import groupedRolemethods from "./rules/grouped-rolemethods.js";
import noThisInContext from "./rules/no-this-in-context.js";
import privateRoleAccess from "./rules/private-role-access.js";
import atomicRoleBinding from "./rules/atomic-role-binding.js";
import literalRoleContracts from "./rules/literal-role-contracts.js";
import immutableRoles from "./rules/immutable-roles.js";
import sortedRoleMethods from "./rules/sorted-rolemethods.js";

const pkg = JSON.parse(
  fs.readFileSync(new URL("../package.json", import.meta.url), "utf8")
);

const pluginName = "dci-lint";

const rules: Array<[string, "error" | "warn" | "off", unknown]> = [
  ["grouped-rolemethods", "error", groupedRolemethods],
  ["no-this-in-context", "error", noThisInContext],
  ["private-role-access", "error", privateRoleAccess],
  ["atomic-role-binding", "error", atomicRoleBinding],

  ["literal-role-contracts", "warn", literalRoleContracts],

  ["immutable-roles", "off", immutableRoles],
  ["sorted-rolemethods", "off", sortedRoleMethods],
];

const plugin = {
  meta: {
    name: "eslint-plugin-" + pluginName,
    version: pkg.version,
  },
  rules: Object.fromEntries(rules.map((rule) => [rule[0], rule[2]])),
  configs: {},
};

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        [pluginName]: plugin,
      },
      rules: Object.fromEntries(
        rules.map((rule) => [pluginName + "/" + rule[0], rule[1]])
      ),
    },
  ],
});

export default plugin;
