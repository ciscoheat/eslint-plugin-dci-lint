import {
  AST_NODE_TYPES,
  BlockStatement,
  Identifier,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import { createRule, contextRules, isInContext } from "../DCIRuleHelpers";

export default createRule({
  name: "atomic-role-binding",
  create(context) {
    return contextRules(context, {
      BlockStatement(node: BlockStatement) {
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
          .filter((s) => !!s) as Identifier[];

        // Filter out duplicates
        const assignmentMap = new Map(assignments.map((a) => [a.name, a]));

        // Check if all assignments are made in the same block.
        const allRoles = new Set(
          Array.from(dciContext.roles.entries())
            .filter(([, roleId]) => roleId.kind != "const")
            .map(([role]) => role)
        );

        if (assignmentMap.size > 0) {
          if (assignmentMap.size < allRoles.size) {
            context.report({
              loc: node.loc,
              messageId: "tooFew",
              data: {
                missing: Array.from(allRoles.values())
                  .filter((r) => !assignments.find((a) => a.name == r))
                  .join(","),
              },
            });
          } else {
            // Binding ok!
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description: "All Roles must be bound (reassigned) in the same function.",
      recommended: "error",
    },
    messages: {
      tooFew: `All Roles must be bound (reassigned) in the same function. Missing: {{missing}}`,
      alreadyDeclared: `Roles are already bound elsewhere in the Context`,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
