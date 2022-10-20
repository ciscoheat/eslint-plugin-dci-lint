import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

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

const publicRoleSplitter = "_";
const privateRoleSplitter = "__";

const isContextRegexp = /\W*@context\b/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contexts = new WeakMap<RuleContext<any, any>, FunctionDeclaration>();
const currentContexts = new WeakSet<FunctionDeclaration>();

export const isRoleMethod = (name: string | undefined) =>
  name && name.includes(publicRoleSplitter);

export const roleMethod = (name: string | undefined): RoleMethodCall | null => {
  if (!name || !isRoleMethod(name)) return null;

  const isPrivate = name.includes(privateRoleSplitter);
  const parts = name.split(
    isPrivate ? privateRoleSplitter : publicRoleSplitter
  );

  return { role: parts[0] as string, method: parts[1] as string, isPrivate };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInContext = (context: RuleContext<any, any>) =>
  contexts.has(context);

export const isContext = (node: FunctionDeclaration) =>
  currentContexts.has(node);

export const contextRules = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: RuleContext<any, any>,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = (fun: FunctionDeclaration) => {
    if (contexts.get(context) === fun) {
      //console.log("Exiting Context " + fun?.id?.name);
      contexts.delete(context);
      currentContexts.delete(fun);
    }
  };

  rule[" FunctionDeclaration"] = (fun: FunctionDeclaration) => {
    if (!contexts.has(context)) {
      const source = context.getSourceCode();

      // TODO: Error if nested contexts (@context in comments on multiple ancestors)
      const comments = [fun, ...context.getAncestors()]
        .flatMap((n) => source.getCommentsBefore(n))
        .map((c) => c.value)
        .join(" ");

      if (comments.match(isContextRegexp)) {
        contexts.set(context, fun);
        currentContexts.add(fun);
        //console.log("Entering Context " + fun.id?.name);
      }
    }
  };

  return rule;
};
