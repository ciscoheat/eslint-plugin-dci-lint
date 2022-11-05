import {
  AST_NODE_TYPES,
  Expression,
  TypeNode,
} from "@typescript-eslint/types/dist/generated/ast-spec";

import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";

const errorMsg =
  "Role contracts must be defined using an object type, array[], Iterable or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types";

const allowedLiteralTypes: string[] = [
  AST_NODE_TYPES.TSTypeLiteral,
  AST_NODE_TYPES.TSNumberKeyword,
  AST_NODE_TYPES.TSStringKeyword,
  AST_NODE_TYPES.TSBooleanKeyword,
  AST_NODE_TYPES.TSBigIntKeyword,
];

const allowedExpressionTypes: string[] = [
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.ObjectExpression,
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

          const error = () =>
            context.report({
              loc: contract?.loc ?? role.id.loc,
              messageId: "literal",
            });

          if (!contract) {
            error();
          } else if (contract.type == AST_NODE_TYPES.TSTypeAnnotation) {
            const contractType = contract.typeAnnotation;
            let nodeToCheck: TypeNode = contractType;

            if (contractType.type == AST_NODE_TYPES.TSArrayType) {
              nodeToCheck = contractType.elementType;
            } else if (
              contractType.type == AST_NODE_TYPES.TSTypeReference &&
              contractType.typeName.type == AST_NODE_TYPES.Identifier &&
              contractType.typeName.name == "Iterable" &&
              contractType.typeParameters?.params.length == 1
            ) {
              nodeToCheck = contractType.typeParameters.params[0] as TypeNode;
            }

            if (!allowedLiteralTypes.includes(nodeToCheck.type)) {
              error();
            }
          } else {
            let exprsToCheck = [contract];
            if (
              contract.type == AST_NODE_TYPES.ArrayExpression &&
              contract.elements.length > 0 &&
              !contract.elements.some(
                (e) => e.type == AST_NODE_TYPES.SpreadElement
              )
            ) {
              exprsToCheck = contract.elements as Expression[];
            }

            for (const expr of exprsToCheck) {
              if (!allowedExpressionTypes.includes(expr.type)) error();
            }
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description: errorMsg,
      recommended: "error",
    },
    messages: {
      literal: errorMsg,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
