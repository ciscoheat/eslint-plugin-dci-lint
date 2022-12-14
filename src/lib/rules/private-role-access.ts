import {
  createRule,
  contextRules,
  isInContext,
  isInRoleMethod,
} from "../DCIRuleHelpers";
import type { Identifier } from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";
import debug from "../debug";

const d = debug("private-role-access");

export default createRule({
  name: "private-role-access",
  create(context) {
    return contextRules(context, {
      Identifier(identifier: Identifier) {
        const dciContext = isInContext();
        if (!dciContext) return;

        const currentRM = isInRoleMethod();

        if (dciContext.roles.has(identifier.name)) {
          // Check for ROLE.member access
          if (!currentRM || currentRM.role != identifier.name) {
            if (identifier.parent == dciContext.func) {
              // Check if we're in the parameters of the Context, access is allowed there
            } else if (
              identifier.parent?.type == AST_NODE_TYPES.VariableDeclarator ||
              identifier.parent?.type == AST_NODE_TYPES.AssignmentExpression ||
              identifier.parent?.type == AST_NODE_TYPES.AssignmentPattern
            ) {
              // Check for assignments, that will be handled by the rebinding rule
            } else {
              context.report({
                node: identifier,
                messageId: "externalContractCall",
              });
            }
          }
        } else {
          // Check for ROLE_method access
          const rm = dciContext.roleMethodFromName(identifier.name);
          if (!rm) return;

          if (identifier.parent?.type == AST_NODE_TYPES.VariableDeclarator) {
            // Skip if it's not the definition itself.
          } else if (rm.isPrivate && rm.role != currentRM?.role) {
            d(rm, { depth: 1 });
            d(currentRM, { depth: 1 });
            context.report({
              node: identifier,
              messageId: "privateCall",
            });
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description: "The Role can only be accessed through its own RoleMethods.",
      recommended: "error",
    },
    messages: {
      privateCall: "Accessing a private RoleMethod outside its Role.",
      externalContractCall:
        "Accessing Role contract outside its own RoleMethods.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
