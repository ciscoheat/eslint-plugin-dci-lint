import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { Context, GenericRuleContext, RoleMethodFunction } from "./context.js";
import type { RoleMethod } from "./context.js";
import debug from "./debug.js";
import { RuleListener } from "@typescript-eslint/utils/ts-eslint";

const d = debug("rules");

export interface ExampleTypedLintingRuleDocs {
  description: string;
  recommended?: boolean;
  requiresTypeChecking?: boolean;
}

export const createRule = ESLintUtils.RuleCreator<ExampleTypedLintingRuleDocs>(
  (name) =>
    `https://github.com/ciscoheat/eslint-plugin-dci-lint?tab=readme-ov-file#${name}`
);

// TODO: Role name checking rule
// TODO: Role splitting config setting

const isContextRegexp = /\W*@DCI-context\b/i;

const _currentContext: Context[] = [];
const _currentRoleMethod: RoleMethod[] = [];
let _currentFunction: RoleMethodFunction | null = null;

const currentContext = () => _currentContext[_currentContext.length - 1];
const currentRoleMethod = () =>
  _currentRoleMethod[_currentRoleMethod.length - 1];

export const currentFunction = () => _currentFunction;

export const isRoleMethod = (func: RoleMethodFunction) =>
  func && currentRoleMethod()?.func === func ? currentRoleMethod() : undefined;

export const isContext = (func: RoleMethodFunction) =>
  func && currentContext()?.func === func ? currentContext() : undefined;

export const isInContext = () => currentContext();
export const isInRoleMethod = () => currentRoleMethod();
export const parentContexts = () => _currentContext.slice(0, -1);

const parsedComments = new Set<TSESTree.Comment>();

const enterFunction = (
  func: RoleMethodFunction,
  context: GenericRuleContext
) => {
  _currentFunction = func;

  const currentCtx = currentContext();

  // Skip if we're already in the same context
  if (currentCtx?.func == func) return;

  let roleMethod: RoleMethod | undefined;

  if (currentCtx) {
    // Check if entering a RoleMethod
    roleMethod = currentCtx.roleMethodFromFunc(func);
    if (roleMethod && currentRoleMethod()?.func != func) {
      d(`Entering RoleMethod ${roleMethod.role}.${roleMethod.method}`);
      _currentRoleMethod.push(roleMethod);
    }
  }

  if (!roleMethod) {
    const source = context.sourceCode;

    const comments = [
      func,
      ...(source.getAncestors ? source.getAncestors(func) : []),
    ]
      .filter((n) => n.parent)
      .flatMap((n) => source.getCommentsBefore(n))
      .filter((c) => !parsedComments.has(c));

    const commentStr = comments.map((c) => c.value).join(" ");
    const hasContextComment = commentStr.match(isContextRegexp);

    comments.forEach((c) => parsedComments.add(c));

    if (hasContextComment) {
      // Too many type checks, disabling linter instead.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const name: string =
        // @ts-expect-error Reflecting on type
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        func.id?.name ?? func.parent?.id?.name ?? func.parent?.key?.name;

      d("Entering Context " + name);
      _currentContext.push(new Context(context, name, func));
    }
  }
};

const exitFunction = (func: RoleMethodFunction) => {
  _currentFunction = null;
  const currentCtx = currentContext();

  if (currentCtx?.func == func) {
    d("Exiting Context " + currentCtx.name);
    _currentContext.pop();
  } else {
    const roleMethod = currentCtx?.roleMethodFromFunc(func);
    if (roleMethod && currentRoleMethod()?.func == func) {
      d(`Exiting RoleMethod ${roleMethod.role}.${roleMethod.method}`);
      _currentRoleMethod.pop();
    }
  }
};

export const contextRules = (
  context: GenericRuleContext,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = exitFunction;
  rule[" FunctionExpression:exit"] = exitFunction;
  rule[" ArrowFunctionExpression:exit"] = exitFunction;

  rule[" FunctionDeclaration"] = (func: TSESTree.FunctionDeclaration) =>
    enterFunction(func, context);

  rule[" FunctionExpression"] = (func: TSESTree.FunctionExpression) =>
    enterFunction(func, context);

  rule[" ArrowFunctionExpression"] = (func: TSESTree.ArrowFunctionExpression) =>
    enterFunction(func, context);

  return rule;
};
