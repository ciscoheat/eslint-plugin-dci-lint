import { AST_NODE_TYPES } from "@typescript-eslint/utils";
import {
  createRule,
  contextRules,
  isContext,
  isInContext,
} from "../DCIRuleHelpers";

export default createRule({
  name: "immutable-roles",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        for (const role of dciContext.roles.values()) {
          if (role.kind == "let" || role.kind == "var") {
            context.report({
              loc: role.id.loc,
              messageId: "notImmutableVar",
            });
          }
        }
      },
      AssignmentExpression(node) {
        const dciContext = isInContext();
        if (!dciContext) return;

        if (node.left.type != AST_NODE_TYPES.Identifier) return;
        if (dciContext.roles.has(node.left.name)) {
          context.report({
            loc: node.loc,
            messageId: "immutableAssignment",
          });
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "A Role should be immutable, to prevent reassignment when the Context is executing.",
      recommended: undefined,
    },
    messages: {
      notImmutableVar: `A Role should be immutable, to prevent reassignment when the Context is executing. Use "const" instead.`,
      immutableAssignment: `A Role should be immutable, to prevent reassignment when the Context is executing.`,
    },
    type: "suggestion",
    schema: [],
  },
  defaultOptions: [],
});
