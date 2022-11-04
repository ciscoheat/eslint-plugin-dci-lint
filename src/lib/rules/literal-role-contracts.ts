import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";

const allowedLiteralTypes: string[] = [
  AST_NODE_TYPES.TSTypeLiteral,
  AST_NODE_TYPES.TSNumberKeyword,
  AST_NODE_TYPES.TSStringKeyword,
  AST_NODE_TYPES.TSBooleanKeyword,
  AST_NODE_TYPES.TSBigIntKeyword,
];

export default createRule({
  name: "literal-role-contracts",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node: FunctionDeclaration) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        for (const role of dciContext.roles.values()) {
          const contract = role.contract;

          if (contract.type == AST_NODE_TYPES.ObjectExpression) continue;

          let contractType = contract.typeAnnotation;
          if (contractType.type == AST_NODE_TYPES.TSArrayType) {
            contractType = contractType.elementType;
          }

          if (!allowedLiteralTypes.includes(contractType.type)) {
            context.report({
              loc: contract?.loc ?? role.id.loc,
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
        "Role contracts must be annotated using an object type, array[] or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
      recommended: "error",
    },
    messages: {
      literal:
        "Role contracts must be annotated using an object type, array[] or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
