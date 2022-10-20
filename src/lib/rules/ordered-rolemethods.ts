import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "ordered-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        const nodes = node.body.body;

        // TODO: Should only RoleMethod functions be allowed in top-level?
        const roleMethods = new Map(
          nodes.map((node) => [
            node,
            node.type == AST_NODE_TYPES.FunctionDeclaration
              ? dciContext.roleMethodCall(node.id?.name)
              : null,
          ])
        );

        const rolePos = new Set<string>();
        let currentRole = "";
        let lastNode;

        for (const [node, rm] of roleMethods) {
          if (!rm) {
            // A non-RoleMethod expression, cannot be placed between RoleMethods.
            if (rolePos.size > 0) {
              lastNode = node;
            }
          } else if (lastNode) {
            context.report({
              messageId: "mixed",
              node: lastNode,
            });
            lastNode = null;
          } else {
            if (rm.role != currentRole) {
              if (rolePos.has(rm.role)) {
                context.report({
                  messageId: "unordered",
                  node,
                });
              } else {
                rolePos.add(rm.role);
                currentRole = rm.role;
              }
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
      mixed:
        "Statements and expressions cannot be placed between RoleMethods, only before or after.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
