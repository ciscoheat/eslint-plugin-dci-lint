import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";
import { AST_NODE_TYPES } from "@typescript-eslint/types/dist/generated/ast-spec";

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

const publicRoleSplitter = "_";
const privateRoleSplitter = "__";

const isContextRegexp = /\W*@context\b/i;

class Context {
  readonly func: FunctionDeclaration;
  readonly roles = new Map<string, RoleMethod[]>();
  private funcMap = new Map<FunctionDeclaration, RoleMethod>();

  constructor(func: FunctionDeclaration) {
    this.func = func;

    const functions = func.body.body.filter(
      (n) => n.type == AST_NODE_TYPES.FunctionDeclaration
    ) as FunctionDeclaration[];

    for (const func of functions) {
      const rm = this.roleMethodCall(func.id?.name);
      if (!rm) continue;

      if (!this.roles.has(rm.role)) {
        this.roles.set(rm.role, []);
      }

      const contextRm = {
        role: rm.role,
        method: rm.method,
        isPrivate: rm.isPrivate,
        func,
      };

      this.roles.get(rm.role)?.push(contextRm);
      this.funcMap.set(func, contextRm);
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

let _currentContext: Context | null = null;
let _currentFunction: FunctionDeclaration | null = null;

export const currentContext = () => _currentContext;
export const currentFunction = () => _currentFunction;

export const isInContext = () => currentContext();
export const isContext = (func: FunctionDeclaration) =>
  func && currentContext()?.func === func;

export const contextRules = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: RuleContext<any, any>,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = (func: FunctionDeclaration) => {
    _currentFunction = null;
    if (currentContext()?.func === func) {
      //console.log("Exiting Context " + func?.id?.name);
      _currentContext = null;
    }
  };

  rule[" FunctionDeclaration"] = (func: FunctionDeclaration) => {
    _currentFunction = func;
    if (!currentContext()) {
      const source = context.getSourceCode();

      // TODO: Error if nested contexts (@context in comments on multiple ancestors)
      const comments = [func, ...context.getAncestors()]
        .flatMap((n) => source.getCommentsBefore(n))
        .map((c) => c.value)
        .join(" ");

      if (comments.match(isContextRegexp)) {
        //console.log("Entering Context " + func.id?.name);
        _currentContext = new Context(func);
      }
    }
  };

  return rule;
};
