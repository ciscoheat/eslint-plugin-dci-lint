import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";

const allowedLiteralTypes: string[] = [
  AST_NODE_TYPES.TSTypeLiteral,
  AST_NODE_TYPES.TSNumberKeyword,
  AST_NODE_TYPES.TSStringKeyword,
  AST_NODE_TYPES.TSBooleanKeyword,
  AST_NODE_TYPES.TSBigIntKeyword,
  AST_NODE_TYPES.TSArrayType,
];

export default createRule({
  name: "literal-role-contracts",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node: FunctionDeclaration) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        for (const role of dciContext.roles.values()) {
          if (
            !allowedLiteralTypes.includes(
              role.id.typeAnnotation?.typeAnnotation.type ?? ""
            )
          ) {
            context.report({
              loc: role.id.typeAnnotation?.typeAnnotation.loc ?? role.id.loc,
              messageId: "literal",
            });
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "Role contracts should be annotated using an object type, array[] or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
      recommended: "warn",
    },
    messages: {
      literal:
        "Role contracts should be annotated using an object type, array[] or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
