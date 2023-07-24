import { AST_NODE_TYPES, TSESTree } from "@typescript-eslint/utils";
import { RuleContext } from "@typescript-eslint/utils/ts-eslint";

//import debug from "./debug";
//const d = debug("context");

// TODO: Role name checking rule
// TODO: Role splitting config setting

export type RoleMethodFunction =
  | TSESTree.FunctionDeclaration
  | TSESTree.ArrowFunctionExpression;
export type RoleKind = "const" | "let" | "var" | "param";

export interface RoleMethodCall {
  role: string;
  method: string;
  isPrivate: boolean;
}

export interface RoleMethod extends RoleMethodCall {
  func: RoleMethodFunction;
}

export interface Role {
  name: string;
  id: TSESTree.Identifier;
  methods: RoleMethod[];
  kind: RoleKind;
  // The Role type
  contract: TSESTree.TSTypeAnnotation | TSESTree.Expression | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type GenericRuleContext = RuleContext<any, any>;

const publicRoleSplitter = "_";
const privateRoleSplitter = "__";

export class Context {
  readonly name: string;
  readonly func: RoleMethodFunction;
  readonly roles = new Map<string, Role>();

  private funcMap = new Map<RoleMethodFunction, RoleMethod>();
  private funcNameMap = new Map<string, RoleMethod>();

  static potentialRoleVar(node: TSESTree.Statement) {
    if (node.type != AST_NODE_TYPES.VariableDeclaration) return null;
    const identifiers = node.declarations
      .filter((d) => d.id.type == AST_NODE_TYPES.Identifier)
      .map((d) => d.id as TSESTree.Identifier);

    return { identifiers, kind: node.kind };
  }

  constructor(
    context: GenericRuleContext,
    name: string,
    func: RoleMethodFunction
  ) {
    this.name = name;
    this.func = func;

    if (func.body.type != AST_NODE_TYPES.BlockStatement) {
      context.report({
        loc: func.body.loc,
        message:
          "A Context must be defined with a block statement (curly braces)",
      } as never);
      return;
    }

    const potentialRoles: Map<string, Omit<Role, "methods">> = new Map();

    for (const p of func.params) {
      if (p.type == AST_NODE_TYPES.Identifier) {
        potentialRoles.set(p.name, {
          name: p.name,
          id: p,
          kind: "param" as RoleKind,
          contract: p.typeAnnotation,
        });
      } else if (
        p.type == AST_NODE_TYPES.AssignmentPattern &&
        p.left.type == AST_NODE_TYPES.Identifier
      ) {
        potentialRoles.set(p.left.name, {
          name: p.left.name,
          id: p.left,
          kind: "param" as RoleKind,
          contract: p.left.typeAnnotation ?? p.right,
        });
      }
    }

    const statements = func.body.body;

    // Check if a top-level statement exists as a potential Role.
    for (const s of statements) {
      const roleVar = Context.potentialRoleVar(s);
      if (roleVar) {
        for (const id of roleVar.identifiers) {
          let contract: Role["contract"] | undefined = id.typeAnnotation;
          if (
            !contract &&
            id.parent?.type == AST_NODE_TYPES.VariableDeclarator
          ) {
            contract = id.parent.init ?? undefined;
          }

          if (contract) {
            potentialRoles.set(id.name, {
              name: id.name,
              id,
              kind: roleVar.kind,
              contract,
            });
          }
        }
      }
    }

    //console.log(potentialRoles.keys());

    const functions = new Map<
      string,
      { func: RoleMethodFunction; decl: TSESTree.VariableDeclaration | null }
    >();
    for (const s of statements) {
      if (s.type == AST_NODE_TYPES.FunctionDeclaration) {
        functions.set(s.id.name, { func: s, decl: null });
      } else if (s.type == AST_NODE_TYPES.VariableDeclaration) {
        for (const declaration of s.declarations) {
          if (
            declaration.type != AST_NODE_TYPES.VariableDeclarator ||
            declaration.init?.type != AST_NODE_TYPES.ArrowFunctionExpression
          ) {
            continue;
          }
          // Type definition is wrong, name exists on the Identifier.
          const name = (declaration.id as TSESTree.Identifier).name;
          if (!name) {
            context.report({
              loc: declaration.loc,
              message: `Name not found for function`,
            } as never);
          }
          functions.set(name, { func: declaration.init, decl: s });
        }
      }
    }

    // Check if a function is a RoleMethod
    for (const [name, expr] of functions.entries()) {
      const rm = this.roleMethodCall(name);
      if (!rm || !rm.role.length) continue;

      if (expr.decl && expr.decl.kind !== "const") {
        context.report({
          loc: expr.decl.loc,
          message: `A RoleMethod must be declared as const`,
        } as never);
        continue;
      }

      const contextRm = {
        role: rm.role,
        method: rm.method,
        isPrivate: rm.isPrivate,
        func: expr.func,
      };

      this.funcMap.set(expr.func, contextRm);
      this.funcNameMap.set(name, contextRm);

      if (!this.roles.has(rm.role)) {
        // Check if a potential role exist, if so, add the Role.
        if (potentialRoles.has(rm.role)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const role = potentialRoles.get(rm.role)!;
          this.roles.set(rm.role, { ...role, methods: [contextRm] });
        } else {
          context.report({
            loc: expr.func.loc,
            message: `Role "${rm.role}" not found for RoleMethod "${rm.method}"`,
          } as never);
        }
      } else {
        this.roles.get(rm.role)?.methods?.push(contextRm);
      }
    }
  }

  roleMethodFromFunc(func: RoleMethodFunction) {
    return this.funcMap.get(func);
  }

  roleMethodFromName(name: string) {
    return this.funcNameMap.get(name);
  }

  isRoleMethod(name: string | undefined) {
    return name && name.includes(publicRoleSplitter);
  }

  roleMethodCall(name: string | undefined): RoleMethodCall | null {
    if (!name || !this.isRoleMethod(name)) return null;

    const isPrivate = name.includes(privateRoleSplitter);
    const parts = name.split(
      isPrivate ? privateRoleSplitter : publicRoleSplitter
    );

    return { role: parts[0] as string, method: parts[1] as string, isPrivate };
  }
}
