import {
  createRule,
  contextRules,
  currentContext,
  currentFunction,
  RoleMethodCall,
} from "../DCIRuleHelpers";
import type {
  //FunctionDeclaration,
  //CallExpression,
  //Node,
  MemberExpression,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "private-rolemethods",
  create(context) {
    return contextRules(context, {
      CallExpression(callExpr) {
        const dciContext = currentContext();
        if (!dciContext) return;

        const currentFunc = currentFunction();

        const checkAllowedCall = (
          call: RoleMethodCall,
          isContractCall: boolean
        ) => {
          const caller = dciContext.roleMethodCall(currentFunc?.id?.name);
          //console.log("Check call:", call);

          // Within same Role is always allowed
          if (caller && caller.role == call.role) return;

          if (call.isPrivate) {
            context.report({
              node: callExpr,
              messageId: isContractCall ? "privateContractCall" : "privateCall",
            });
          }
        };

        switch (callExpr.callee.type) {
          case AST_NODE_TYPES.Identifier: {
            const calledRoleMethod = dciContext.roleMethodCall(
              callExpr.callee.name
            );
            if (calledRoleMethod) checkAllowedCall(calledRoleMethod, false);
            break;
          }

          case AST_NODE_TYPES.MemberExpression: {
            const member = callExpr.callee as MemberExpression;
            if (
              member.object.type == AST_NODE_TYPES.Identifier &&
              member.property.type == AST_NODE_TYPES.Identifier
            ) {
              if (dciContext.roles.has(member.object.name)) {
                checkAllowedCall(
                  {
                    role: member.object.name,
                    method: member.property.name,
                    isPrivate: true,
                  },
                  true
                );
              }
            }
            break;
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
