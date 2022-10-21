import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import {
  AST_NODE_TYPES,
  Identifier,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericRuleContext = RuleContext<any, any>;

const publicRoleSplitter = "_";
const privateRoleSplitter = "__";

const isContextRegexp = /\W*@DCI-context\b/i;

class Context {
  readonly func: FunctionDeclaration;
  readonly roles = new Map<string, { id: Identifier; methods: RoleMethod[] }>();
  private funcMap = new Map<FunctionDeclaration, RoleMethod>();

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
      ).map((i) => [i.name, i])
    );

    const statements = func.body.body;

    // Check if a top-level statement exists as a potential Role.
    for (const s of statements) {
      if (
        s.type == AST_NODE_TYPES.VariableDeclaration &&
        s.declarations.length == 1 &&
        s.declarations[0]?.type == AST_NODE_TYPES.VariableDeclarator &&
        s.declarations[0]?.id.type == AST_NODE_TYPES.Identifier
      ) {
        const declaration = s.declarations[0].id;
        potentialRoles.set(declaration.name, declaration);
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

      if (!this.roles.has(rm.role)) {
        // Check if a potential role exist, if so, add the Role.
        if (potentialRoles.has(rm.role)) {
          this.roles.set(rm.role, {
            id: potentialRoles.get(rm.role) as Identifier,
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
        this.funcMap.set(func, contextRm);
      }
    }
  }

  roleMethodFromFunc(func: FunctionDeclaration) {
    return this.funcMap.get(func);
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
let _currentFunction: FunctionDeclaration | null = null;

const currentContext = () => _currentContext[_currentContext.length - 1];

export const currentFunction = () => _currentFunction;

export const isInContext = () => currentContext();
export const isContext = (func: FunctionDeclaration) =>
  func && currentContext()?.func === func ? currentContext() : null;

export const contextRules = (
  context: GenericRuleContext,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = (func: FunctionDeclaration) => {
    _currentFunction = null;
    if (currentContext()?.func === func) {
      //console.log("Exiting Context " + func?.id?.name);
      _currentContext.pop();
    }
  };

  rule[" FunctionDeclaration"] = (func: FunctionDeclaration) => {
    _currentFunction = func;

    const currentCtx = currentContext();

    // Skip if we're already in the same context
    if (currentCtx?.func === func) return;

    const source = context.getSourceCode();

    const comments = currentCtx
      ? source.getCommentsBefore(func)
      : [func, ...context.getAncestors()].flatMap((n) =>
          source.getCommentsBefore(n)
        );

    const commentStr = comments.map((c) => c.value).join(" ");
    const hasContextComment = commentStr.match(isContextRegexp);

    if (hasContextComment) {
      //console.log("Entering Context " + func.id?.name);
      _currentContext.push(new Context(context, func));
    }
  };

  return rule;
};
