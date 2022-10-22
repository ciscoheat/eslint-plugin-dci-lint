import {
  createRule,
  contextRules,
  isInContext,
  isInRoleMethod,
} from "../DCIRuleHelpers";
import type { Identifier } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "private-role-access",
  create(context) {
    return contextRules(context, {
      ":matches(MemberExpression, CallExpression) > Identifier"(
        identifier: Identifier
      ) {
        const dciContext = isInContext();
        if (!dciContext) return;

        const currentRM = isInRoleMethod();

        if (dciContext.roles.has(identifier.name)) {
          // Check for ROLE.member access
          if (!currentRM || currentRM.role != identifier.name) {
            context.report({
              node: identifier,
              messageId: "privateContractCall",
            });
          }
        } else {
          // Check for ROLE_method access
          const rm = dciContext.roleMethodFromName(identifier.name);
          if (rm && rm.isPrivate && rm.role != currentRM?.role) {
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
      description: "Call to private RoleMethod outside its Role.",
      recommended: "error",
    },
    messages: {
      privateCall: "Call to private RoleMethod outside its Role.",
      privateContractCall: "Call to Role contract method outside its Role.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
