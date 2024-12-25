import { createRule, contextRules, isInContext } from "../DCIRuleHelpers.js";

const description = `"this" should not be used inside a Context, as it can be confusing what it refers to.`;

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
      description,
      recommended: true,
    },
    messages: {
      noThis: description,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
