import { createRule, contextRules, isInContext } from "../DCIRuleHelpers";

export default createRule({
  name: "no-this-in-context",
  create(context) {
    return contextRules(context, {
      ThisExpression(node) {
        if (!isInContext()) return;
        context.report({
          node,
          messageId: "noThis",
        });
      },
    });
  },
  meta: {
    docs: {
      description: `"this" should not be used inside a Context.`,
      recommended: "error",
    },
    messages: {
      noThis: `"this" should not be used inside a Context.`,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
