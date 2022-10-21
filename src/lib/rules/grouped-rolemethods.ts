import {
  createRule,
  contextRules,
  isContext,
  potentialRoleVar,
} from "../DCIRuleHelpers";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "grouped-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        const nodes = node.body.body;

        const nodeOrder = nodes.map((node) => {
          switch (node.type) {
            case AST_NODE_TYPES.FunctionDeclaration: {
              return dciContext.roleMethodFromFunc(node);
            }
            case AST_NODE_TYPES.VariableDeclaration: {
              const roleVar = potentialRoleVar(node);
              if (roleVar) {
                return roleVar;
              }
            }
          }
          return undefined;
        });

        const usedRoles = new Set<string>();
        let currentRole = "";
        let lastNode;

        for (const rm of nodeOrder) {
          if (!rm) {
            // A non-RoleMethod expression, cannot be placed between RoleMethods.
            if (usedRoles.size > 0) {
              lastNode = node;
            }
          } else if (lastNode) {
            context.report({
              messageId: "mixed",
              node: lastNode,
            });
            lastNode = null;
          } else {
            // Check if RoleMethod is an Identifier
            const roleName = "name" in rm ? rm.name : rm.role;

            if (roleName != currentRole) {
              if (usedRoles.has(roleName)) {
                context.report({
                  messageId: "unordered",
                  loc: "name" in rm ? rm.loc : rm.func.loc,
                });
              } else {
                usedRoles.add(roleName);
                currentRole = roleName;
              }
            }
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "RoleMethods belonging to a Role must come after one another, they cannot be mixed with other declarations in the Context.",
      recommended: "error",
    },
    messages: {
      unordered:
        "RoleMethods belonging to a Role must come after one another, they cannot be mixed with other declarations in the Context.",
      mixed:
        "Statements and expressions cannot be placed between RoleMethods, only before or after.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
