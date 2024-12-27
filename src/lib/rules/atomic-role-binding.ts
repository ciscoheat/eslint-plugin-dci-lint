import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule, contextRules, isInContext } from "../DCIRuleHelpers.js";
import { Context } from "../context.js";

const errorMessage =
  "All Roles must be bound (reassigned) in only one function per Context.";

export default createRule({
  name: "atomic-role-binding",
  create(context) {
    const bindings = new Map<Context, TSESTree.BlockStatement>();
    return contextRules(context, {
      BlockStatement(node: TSESTree.BlockStatement) {
        const dciContext = isInContext();
        if (!dciContext) return;

        //console.log(dciContext.roles.keys());

        // Filter all assignments
        const assignments = node.body
          .map((s) => {
            return s.type == AST_NODE_TYPES.ExpressionStatement &&
              s.expression.type == AST_NODE_TYPES.AssignmentExpression &&
              s.expression.left.type == AST_NODE_TYPES.Identifier &&
              dciContext.roles.has(s.expression.left.name)
              ? s.expression.left
              : null;
          })
          .filter((s) => !!s);

        // Filter out duplicates
        const assignmentMap = new Map(assignments.map((a) => [a.name, a]));

        if (assignmentMap.size > 0) {
          //console.log(dciContext.name, assignmentMap.keys());
          if (bindings.get(dciContext)) {
            context.report({
              loc: node.loc,
              messageId: "alreadyDeclared",
            });
          } else {
            bindings.set(dciContext, node);
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description: errorMessage,
      recommended: true,
    },
    messages: {
      alreadyDeclared: errorMessage,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
