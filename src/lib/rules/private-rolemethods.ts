import {
  createRule,
  contextRules,
  isContext,
  isRoleMethod,
  roleMethod,
  type RoleMethodCall,
} from "../DCIRuleHelpers";
import type {
  FunctionDeclaration,
  CallExpression,
  MemberExpression,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";
import esquery from "esquery";

type Node = Parameters<typeof esquery>[0];

export default createRule({
  name: "private-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        if (!isContext(node)) return;
        const functions = node.body.body.filter(
          (n) => n.type == AST_NODE_TYPES.FunctionDeclaration
        ) as FunctionDeclaration[];

        //console.log(functions.map((f) => f.id?.name));

        const roleMethods = functions.filter((f) => isRoleMethod(f.id?.name));
        const roles = new Set(
          functions
            .map((f) => roleMethod(f.id?.name))
            .filter((rm) => rm)
            .map((rm) => rm?.role ?? "")
        );

        //console.log("Roles in context: " + Array.from(roles.keys()));

        for (const method of roleMethods) {
          const callingRoleMethod = roleMethod(method.id?.name);
          //console.log("Calling from: ", callingRoleMethod);

          for (const node of esquery(method as Node, "CallExpression")) {
            const callExpr = node as CallExpression;

            const checkAllowedCall = (
              call: RoleMethodCall,
              isContractCall: boolean
            ) => {
              //console.log("Check call:", call);

              // Within same Role is always allowed
              if (callingRoleMethod && callingRoleMethod.role == call.role)
                return;

              if (call.isPrivate) {
                context.report({
                  node: callExpr,
                  messageId: isContractCall
                    ? "privateContractCall"
                    : "privateCall",
                });
              }
            };

            switch (callExpr.callee.type) {
              case AST_NODE_TYPES.Identifier: {
                const callingRoleMethod = roleMethod(callExpr.callee.name);
                if (callingRoleMethod)
                  checkAllowedCall(callingRoleMethod, false);
                break;
              }

              case AST_NODE_TYPES.MemberExpression: {
                const member = callExpr.callee as MemberExpression;
                if (
                  member.object.type == AST_NODE_TYPES.Identifier &&
                  member.property.type == AST_NODE_TYPES.Identifier
                ) {
                  if (roles.has(member.object.name)) {
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
