import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { createRule, contextRules, isContext } from "../DCIRuleHelpers.js";
import { Context, Role, RoleMethod } from "../context.js";

//import debug from "../debug";
//const d = debug("grouped-rolemethods");

type OrderedStatement =
  | { method: RoleMethod; loc: TSESTree.SourceLocation }
  | { role: Role; loc: TSESTree.SourceLocation }
  | { loc: TSESTree.SourceLocation };

export default createRule({
  name: "grouped-rolemethods",
  create(context) {
    return contextRules(context, {
      FunctionDeclaration(node) {
        //d(node.id?.name);
        const dciContext = isContext(node);
        if (!dciContext) return;

        const nodes = node.body.body;

        // Make a list of either:
        // - RoleMethods
        // - Declared Roles
        // - Other code
        // And check that they are in the correct order.
        const statements: OrderedStatement[] = nodes.flatMap((node) => {
          switch (node.type) {
            case AST_NODE_TYPES.FunctionDeclaration: {
              const roleMethod = dciContext.roleMethodFromFunc(node);
              if (roleMethod)
                return { loc: roleMethod.func.loc, method: roleMethod };
              break;
            }
            case AST_NODE_TYPES.VariableDeclaration: {
              const role = Context.potentialRoleVar(node);
              if (role) {
                return role.identifiers.map((r) => {
                  if (dciContext.roles.has(r.name))
                    return { loc: r.loc, role: dciContext.roles.get(r.name) };
                  else {
                    const roleMethod = dciContext.roleMethodFromName(r.name);
                    if (roleMethod) {
                      return { loc: r.loc, method: roleMethod };
                    } else {
                      return { loc: r.loc };
                    }
                  }
                });
              }
              break;
            }
          }
          return { loc: node.loc };
        });

        const usedRoles = new Set<string>();
        const declaredRoles = new Set<string>();
        let currentRole = "";
        let otherCodeUsed: TSESTree.SourceLocation | undefined;

        for (const code of statements) {
          if (otherCodeUsed && ("method" in code || "role" in code)) {
            // otherCode is set, so Roles and Methods after that is not allowed.
            context.report({
              messageId: "mixed",
              loc: otherCodeUsed,
            });
          } else if ("role" in code) {
            const roleName = code.role?.name;
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
      recommended: true,
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
