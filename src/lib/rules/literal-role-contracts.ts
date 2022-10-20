import { createRule, contextRules, isInContext } from "../DCIRuleHelpers";
import type {
  Identifier,
  FunctionDeclaration,
} from "@typescript-eslint/types/dist/generated/ast-spec";

const allowedLiteralTypes = [
  "TSTypeLiteral",
  "TSNumberKeyword",
  "TSStringKeyword",
  "TSBooleanKeyword",
];

export default createRule({
  name: "literal-role-contracts",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node: FunctionDeclaration) {
        if (!isInContext(context)) return;
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
        "Role interfaces must be declared using an object type or primitive type.",
      recommended: "error",
    },
    messages: {
      literal:
        "Role interfaces must be declared using an object type or primitive type. https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#object-types",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
