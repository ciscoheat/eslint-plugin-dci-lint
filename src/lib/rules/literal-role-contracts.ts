import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type {
  Identifier,
  FunctionDeclaration,
} from "@typescript-eslint/types/dist/generated/ast-spec";

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
        if (!isContext(node)) return;

        for (const param of node.params as Identifier[])
          if (
            !allowedLiteralTypes.includes(
              param.typeAnnotation?.typeAnnotation.type ?? ""
            )
          ) {
            context.report({
              loc: param.loc,
              messageId: "literal",
            });
          }
      },
    });
  },
  meta: {
    docs: {
      description:
        "Role interfaces must be declared using an object type, array or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
      recommended: "error",
    },
    messages: {
      literal:
        "Role interfaces must be declared using an object type, array or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
