import { createRule, contextRules, isContext } from "../DCIRuleHelpers";

export default createRule({
  name: "uppercase-roles",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        for (const [roleName, role] of dciContext.roles) {
          if (roleName !== roleName.toLocaleUpperCase()) {
            context.report({
              node: role.id,
              messageId: "notUppercase",
            });
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "A Role name should be uppercase, to make it easy to identity in the code.",
      recommended: "warn",
    },
    messages: {
      notUppercase:
        "A Role name should be uppercase, to make it easy to identity in the code.",
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
