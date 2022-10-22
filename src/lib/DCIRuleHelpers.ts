import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import {
  AST_NODE_TYPES,
  Identifier,
  Statement,
} from "@typescript-eslint/types/dist/generated/ast-spec";

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

// TODO: Role name checking rule
// TODO: Role splitting config setting

export interface RoleMethodCall {
  role: string;
  method: string;
  isPrivate: boolean;
}

interface RoleMethod extends RoleMethodCall {
  func: FunctionDeclaration;
}

type RoleKind = "const" | "let" | "var" | "param";

interface Role {
  name: string;
  id: Identifier;
  methods: RoleMethod[];
  kind: RoleKind;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericRuleContext = RuleContext<any, any>;

export function potentialRoleVar(node: Statement) {
  return node.type == AST_NODE_TYPES.VariableDeclaration &&
    node.declarations.length == 1 &&
    node.declarations[0]?.type == AST_NODE_TYPES.VariableDeclarator &&
    node.declarations[0]?.id.type == AST_NODE_TYPES.Identifier
    ? { id: node.declarations[0].id, kind: node.kind }
    : null;
}

const publicRoleSplitter = "_";
const privateRoleSplitter = "__";

const isContextRegexp = /\W*@DCI-context\b/i;

export class Context {
  readonly func: FunctionDeclaration;
  readonly roles = new Map<string, Role>();
  private funcMap = new Map<FunctionDeclaration, RoleMethod>();
  private funcNameMap = new Map<string, RoleMethod>();

  constructor(context: GenericRuleContext, func: FunctionDeclaration) {
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
      const roleVar = potentialRoleVar(s);
      if (roleVar) {
        potentialRoles.set(roleVar.id.name, {
          id: roleVar.id,
          kind: roleVar.kind,
        });
      }
    }

    //console.log(potentialRoles.keys());

    const functions = statements.filter(
      (n) => n.type == AST_NODE_TYPES.FunctionDeclaration
    ) as FunctionDeclaration[];

    // Check if a function is a RoleMethod
    for (const func of functions) {
      const rm = this.roleMethodCall(func.id?.name);
      if (!rm) continue;

      const contextRm = {
        role: rm.role,
        method: rm.method,
        isPrivate: rm.isPrivate,
        func,
      };

      this.funcMap.set(func, contextRm);
      this.funcNameMap.set(func.id?.name as string, contextRm);

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

  roleMethodFromFunc(func: FunctionDeclaration) {
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

const _currentContext: Context[] = [];
const _currentRoleMethod: RoleMethod[] = [];
let _currentFunction: FunctionDeclaration | null = null;

const currentContext = () => _currentContext[_currentContext.length - 1];
const currentRoleMethod = () =>
  _currentRoleMethod[_currentRoleMethod.length - 1];

export const currentFunction = () => _currentFunction;

export const isRoleMethod = (func: FunctionDeclaration) =>
  func && currentRoleMethod()?.func === func ? currentRoleMethod() : undefined;

export const isContext = (func: FunctionDeclaration) =>
  func && currentContext()?.func === func ? currentContext() : undefined;

export const isInContext = () => currentContext();
export const isInRoleMethod = () => currentRoleMethod();

export const contextRules = (
  context: GenericRuleContext,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = (func: FunctionDeclaration) => {
    _currentFunction = null;
    const currentCtx = currentContext();

    if (currentCtx?.func == func) {
      //console.log("Exiting Context " + func?.id?.name);
      _currentContext.pop();
    } else {
      const roleMethod = currentCtx?.roleMethodFromFunc(func);
      if (roleMethod && currentRoleMethod()?.func == func) {
        //console.log(`Exiting RoleMethod ${roleMethod.func.id?.name}`);
        _currentRoleMethod.pop();
      }
    }
  };

  rule[" FunctionDeclaration"] = (func: FunctionDeclaration) => {
    _currentFunction = func;

    const currentCtx = currentContext();

    // Skip if we're already in the same context
    if (currentCtx?.func == func) return;

    let roleMethod: RoleMethod | undefined;

    if (currentCtx) {
      // Check if entering a RoleMethod
      roleMethod = currentCtx.roleMethodFromFunc(func);
      if (roleMethod && currentRoleMethod()?.func != func) {
        //console.log(`Entering RoleMethod ${roleMethod.func.id?.name}`);
        _currentRoleMethod.push(roleMethod);
      }
    }

    if (!roleMethod) {
      const source = context.getSourceCode();

      const comments = currentCtx
        ? source.getCommentsBefore(func)
        : [func, ...context.getAncestors()]
            .filter((n) => n.parent)
            .flatMap((n) => source.getCommentsBefore(n));

      const commentStr = comments.map((c) => c.value).join(" ");
      const hasContextComment = commentStr.match(isContextRegexp);

      if (hasContextComment) {
        //console.log("Entering Context " + func.id?.name);
        _currentContext.push(new Context(context, func));
      }
    }
  };

  return rule;
};
