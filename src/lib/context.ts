import type {
  FunctionDeclaration,
  ArrowFunctionExpression,
} from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import {
  AST_NODE_TYPES,
  Identifier,
  Statement,
} from "@typescript-eslint/types/dist/generated/ast-spec";

// TODO: Role name checking rule
// TODO: Role splitting config setting

export type RoleMethodFunction = FunctionDeclaration | ArrowFunctionExpression;
export type RoleKind = "const" | "let" | "var" | "param";

export interface RoleMethodCall {
  role: string;
  method: string;
  isPrivate: boolean;
}

export interface RoleMethod extends RoleMethodCall {
  func: RoleMethodFunction;
}

interface Role {
  name: string;
  id: Identifier;
  methods: RoleMethod[];
  kind: RoleKind;
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

  static potentialRoleVar(node: Statement) {
    return node.type == AST_NODE_TYPES.VariableDeclaration &&
      node.declarations.length == 1 &&
      node.declarations[0]?.type == AST_NODE_TYPES.VariableDeclarator &&
      node.declarations[0]?.id.type == AST_NODE_TYPES.Identifier
      ? { id: node.declarations[0].id, kind: node.kind }
      : null;
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

    const potentialRoles = new Map(
      (
        func.params.filter(
          (p) => p.type == AST_NODE_TYPES.Identifier
        ) as Identifier[]
      ).map((i) => [i.name, { id: i, kind: "param" as RoleKind }])
    );

    const statements = func.body.body;

    // Check if a top-level statement exists as a potential Role.
    for (const s of statements) {
      const roleVar = Context.potentialRoleVar(s);
      if (roleVar) {
        potentialRoles.set(roleVar.id.name, {
          id: roleVar.id,
          kind: roleVar.kind,
        });
      }
    }

    //console.log(potentialRoles.keys());

    const functions = new Map<string, RoleMethodFunction>();
    for (const s of statements) {
      if (s.type == AST_NODE_TYPES.FunctionDeclaration) {
        functions.set(s.id.name, s);
      } else if (
        s.type == AST_NODE_TYPES.VariableDeclaration &&
        s.declarations.length == 1 &&
        s.declarations[0]?.type == AST_NODE_TYPES.VariableDeclarator &&
        s.declarations[0]?.init?.type == AST_NODE_TYPES.ArrowFunctionExpression
      ) {
        // Type description is wrong, name exists on the Identifier.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const declarator = s.declarations[0] as any;
        const name = declarator.id.name;
        if (!name) {
          context.report({
            loc: declarator.loc,
            message: `Name not found for function`,
          } as never);
        }
        functions.set(name, s.declarations[0].init);
      }
    }

    // Check if a function is a RoleMethod
    for (const [name, func] of functions) {
      const rm = this.roleMethodCall(name);
      if (!rm) continue;

      const contextRm = {
        role: rm.role,
        method: rm.method,
        isPrivate: rm.isPrivate,
        func,
      };

      this.funcMap.set(func, contextRm);
      this.funcNameMap.set(name, contextRm);

      if (!this.roles.has(rm.role)) {
        // Check if a potential role exist, if so, add the Role.
        if (potentialRoles.has(rm.role)) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const role = potentialRoles.get(rm.role)!;
          this.roles.set(rm.role, {
            name: rm.role,
            id: role.id,
            kind: role.kind,
            methods: [contextRm],
          });
        } else {
          context.report({
            node: func,
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
