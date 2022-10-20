import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "ordered-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        if (!isContext(node)) return;
        const functions = node.body.body.filter(
          (n) => n.type == AST_NODE_TYPES.FunctionDeclaration
        ) as FunctionDeclaration[];

        // TODO: Should only RoleMethod functions be allowed in top-level?
        let errors = false;
        for (const node of functions) {
          if (!node.id) {
            context.report({
              messageId: "noname",
              node,
            });
            errors = true;
          }
        }
        if (errors) return;

        const rolePos = new Set<string>();

        let currentRole = "";
        for (const f of functions) {
          // TODO: Role name checking rule
          // TODO: Role splitting config setting
          const role = f.id?.name.split("_")[0] ?? "";
          if (role != currentRole) {
            if (rolePos.has(role)) {
              context.report({
                messageId: "unordered",
                node: f,
              });
            } else {
              rolePos.add(role);
              currentRole = role;
            }
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description: "A RoleMethod must be a named function.",
      recommended: "error",
    },
    messages: {
      noname: "A RoleMethod must be a named function.",
      unordered: "RoleMethods belonging to a Role must be grouped together.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
