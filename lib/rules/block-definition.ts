import { createRule, contextRules, isContext } from "../DCIRuleHelpers";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "ordered-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        if (!isContext(node)) return;
        if (node.body.type != AST_NODE_TYPES.BlockStatement) {
          context.report({
            loc: node.body.loc,
            messageId: "block",
          });
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "A Context must be defined with a block statement (curly braces)",
      recommended: "error",
    },
    messages: {
      block: "A Context must be defined with a block statement (curly braces)",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
