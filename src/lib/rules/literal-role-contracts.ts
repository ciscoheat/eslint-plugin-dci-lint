import {
  AST_NODE_TYPES,
  Expression,
  TypeNode,
} from "@typescript-eslint/types/dist/generated/ast-spec";

import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";

const errorMsg =
  "Role contracts must be defined using an object type, array[], Iterable or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types";

const allowedLiteralTypes = new Set([
  AST_NODE_TYPES.TSTypeLiteral,
  AST_NODE_TYPES.TSNumberKeyword,
  AST_NODE_TYPES.TSStringKeyword,
  AST_NODE_TYPES.TSBooleanKeyword,
  AST_NODE_TYPES.TSBigIntKeyword,
]);

const allowedExpressionTypes = new Set([
  AST_NODE_TYPES.Literal,
  AST_NODE_TYPES.ObjectExpression,
]);

const allowedTypeParameters = new Set(["Iterable", "Array", "Map", "Set"]);

const checkTypeNode = (contractType: TypeNode): TypeNode[] => {
  if (contractType.type == AST_NODE_TYPES.TSUnionType) {
    return contractType.types.flatMap(checkTypeNode);
  } else if (contractType.type == AST_NODE_TYPES.TSArrayType) {
    return checkTypeNode(contractType.elementType);
  } else if (
    contractType.type == AST_NODE_TYPES.TSTypeReference &&
    contractType.typeName.type == AST_NODE_TYPES.Identifier &&
    allowedTypeParameters.has(contractType.typeName.name) &&
    contractType.typeParameters?.params &&
    contractType.typeParameters?.params.length > 0
  ) {
    return contractType.typeParameters.params.flatMap(checkTypeNode);
  } else {
    return [contractType];
  }
};

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
            const nodesToCheck: TypeNode[] = checkTypeNode(
              contract.typeAnnotation
            );

            for (const typeNode of nodesToCheck) {
              if (!allowedLiteralTypes.has(typeNode.type)) {
                error();
              }
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
              if (!allowedExpressionTypes.has(expr.type)) error();
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
