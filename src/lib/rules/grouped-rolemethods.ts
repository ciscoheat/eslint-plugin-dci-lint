import {
  createRule,
  contextRules,
  isContext,
  potentialRoleVar,
} from "../DCIRuleHelpers";
import {
  AST_NODE_TYPES,
  SourceLocation,
} from "@typescript-eslint/types/dist/generated/ast-spec";

export default createRule({
  name: "grouped-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        const dciContext = isContext(node);
        if (!dciContext) return;

        const nodes = node.body.body;

        // Make a list of either:
        // - RoleMethods
        // - Declared Roles
        // - Other code
        // And check that they are in the correct order.
        const statements = nodes.map((node) => {
          switch (node.type) {
            case AST_NODE_TYPES.FunctionDeclaration: {
              const roleMethod = dciContext.roleMethodFromFunc(node);
              if (roleMethod)
                return { loc: roleMethod.func.loc, method: roleMethod };
              break;
            }
            case AST_NODE_TYPES.VariableDeclaration: {
              const role = potentialRoleVar(node);
              if (role && dciContext.roles.has(role.id.name))
                return {
                  loc: role.id.loc,
                  role: dciContext.roles.get(role.id.name),
                };
              break;
            }
          }
          return { loc: node.loc };
        });

        //console.log(potentialRoles);

        const usedRoles = new Set<string>();
        const declaredRoles = new Set<string>();
        let currentRole = "";
        let otherCodeUsed: SourceLocation | undefined;

        for (const code of statements) {
          if (otherCodeUsed && ("method" in code || "role" in code)) {
            // otherCode is set, so Roles and Methods after that is not allowed.
            context.report({
              messageId: "mixed",
              loc: code.loc,
            });
          } else if ("role" in code) {
            const roleName = code.role?.name as string;
            // A Role declaration, so all RoleMethods belonging to this role must come after.
            if (usedRoles.has(roleName)) {
              context.report({
                messageId: "declaredAfter",
                loc: code.loc,
              });
            } else {
              usedRoles.add(roleName);
              declaredRoles.add(roleName);
              currentRole = roleName;
            }
          } else if ("method" in code) {
            const roleName = code.method.role;

            // Are we switching to another Role/RoleMethod
            if (roleName != currentRole) {
              // But it has already been used
              if (usedRoles.has(roleName)) {
                context.report({
                  messageId: "unordered",
                  loc: code.loc,
                });
              } else {
                usedRoles.add(roleName);
                currentRole = roleName;
              }
            }
          } else if (usedRoles.size > 0) {
            // Other statement, but Roles are used, so from now on, only non-RoleMethods are allowed.
            otherCodeUsed = code.loc;
          }
        }
      },
    });
  },
  meta: {
    docs: {
      description:
        "RoleMethods must come after one another, they cannot be mixed with other code in the Context.",
      recommended: "error",
    },
    messages: {
      unordered:
        "RoleMethods must come after one another, they cannot be mixed with other code in the Context.",
      mixed:
        "Statements and expressions cannot be placed between RoleMethods and Roles, only before or after.",
      declaredAfter: `A Role must be declared before its RoleMethods.`,
    },
    type: "problem",
    schema: [],
  },
  defaultOptions: [],
});
