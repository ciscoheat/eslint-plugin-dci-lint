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
      description: "A RoleMethod must be a named function.",
      recommended: "error",
    },
    messages: {
      notUppercase: "A Role name should be uppercased.",
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
