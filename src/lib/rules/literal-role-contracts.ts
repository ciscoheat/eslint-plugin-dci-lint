import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule, contextRules, isContext } from "../DCIRuleHelpers";

const description =
  "Role contracts should be defined using an object type, Iterable or primitive type. More info: https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types";

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

const allowedTypeParameters = new Set([
  "Iterable",
  "Array",
  "Map",
  "Set",
  "Readonly",
  "NonNullable",
  "Awaited",
]);

const checkTypeNode = (
  contractType: TSESTree.TypeNode
): TSESTree.TypeNode[] => {
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
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
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
            const nodesToCheck: TSESTree.TypeNode[] = checkTypeNode(
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
                (e) => e && e.type == AST_NODE_TYPES.SpreadElement
              )
            ) {
              exprsToCheck = contract.elements as TSESTree.Expression[];
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
      description,
      recommended: "recommended",
    },
    messages: {
      literal: description,
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
