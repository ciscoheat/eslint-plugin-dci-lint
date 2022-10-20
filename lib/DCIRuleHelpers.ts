import { ESLintUtils } from "@typescript-eslint/utils";
import type { RuleListener } from "@typescript-eslint/utils/dist/ts-eslint";
import type { FunctionDeclaration } from "@typescript-eslint/types/dist/generated/ast-spec";
import type { RuleContext } from "@typescript-eslint/utils/dist/ts-eslint";

export const createRule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rule/${name}`
);

const isContextRegexp = /\W*@context\b/i;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const contexts = new WeakMap<RuleContext<any, any>, FunctionDeclaration>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isInContext = (context: RuleContext<any, any>) =>
  contexts.has(context);

export const contextRules = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: RuleContext<any, any>,
  rule: RuleListener
) => {
  rule[" FunctionDeclaration:exit"] = (fun: FunctionDeclaration) => {
    if (contexts.get(context) === fun) {
      console.log("exiting " + fun?.id?.name);
      contexts.delete(context);
    }
  };

  rule[" FunctionDeclaration"] = (fun: FunctionDeclaration) => {
    if (!contexts.has(context)) {
      const source = context.getSourceCode();
      const comments = [fun, ...context.getAncestors()]
        .flatMap((n) => source.getCommentsBefore(n))
        .map((c) => c.value)
        .join(" ");

      if (comments.match(isContextRegexp)) {
        contexts.set(context, fun);
        console.log("entering " + fun.id?.name);
      }
    }
  };

  return rule;
};
