import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import { Context, RoleMethodFunction } from "../context";
import { AST_NODE_TYPES } from "@typescript-eslint/utils";

export default createRule({
  name: "sorted-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        const roleOrder = node.body.body
          .flatMap((s) => {
            if (s.type == AST_NODE_TYPES.VariableDeclaration) {
              const roleVar = Context.potentialRoleVar(s);
              if (!roleVar) return null;
              return roleVar.identifiers.map((r) =>
                dciContext.roleMethodFromName(r.name) ? r.name : null
              );
            } else if (s.type == AST_NODE_TYPES.FunctionDeclaration) {
              return dciContext.roleMethodFromName(s.id.name)
                ? s.id.name
                : null;
            } else {
              return null;
            }
          })
          .filter((s) => s) as string[];

        let current = "";
        for (const role of roleOrder) {
          if (current > role) {
            context.report({
              node: dciContext.roleMethodFromName(role)
                ?.func as RoleMethodFunction,
              messageId: "unsorted",
            });
          } else {
            current = role;
          }
        }

        // Make a list of Roles, check that they are in the correct order.
      },
    });
  },
  meta: {
    docs: {
      description: "RoleMethods should be sorted alphabetically.",
      recommended: "warn",
    },
    messages: {
      unsorted: "RoleMethods should be sorted alphabetically.",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
