# eslint-plugin-dci-lint

A typescript ESLint plugin that helps you adhere to DCI conventions. For more information about DCI (Data, Context and Interaction), see [https://fulloo.info](https://fulloo.info).

## Installation

You'll first need to install [ESLint](https://eslint.org/) and the required typescript packages:

```sh
npm i --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint typescript
```

Next, install `eslint-plugin-dci-lint`:

```sh
npm i --save-dev eslint-plugin-dci-lint
```

## Configuration

Add `dci-lint` and the typescript parser to your `.eslintrc` configuration file:

```js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:dci-lint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  root: true,
};
```

## Running

In the project directory, you can run ESLint with `npx eslint .` but while coding it's best to use it with a code editor, for example [VS Code](https://code.visualstudio.com/). This [extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) gives you linting as you type (or search for ESLint in the extensions panel).

## How to use / Tutorial

A comprehensive tutorial series is available at [https://blog.encodeart.dev/dci-tutorial-for-typescript-part-1](https://blog.encodeart.dev/dci-tutorial-for-typescript-part-1).

## Supported Rules

### Errors

These rules should not be turned off. [Let me know](https://github.com/ciscoheat/eslint-plugin-dci-lint/issues) if you have a good reason to do so.

- `dci-lint/atomic-role-binding` - All RoleMethods must be bound (assigned) in the same function. Not applicable if `dci-lint/immutable-roles` is enabled.
- `dci-lint/grouped-rolemethods` - RoleMethods must be grouped together, without unrelated code between them.
- `dci-lint/literal-role-contracts` - Role contracts can only be defined as an [object type](https://www.typescriptlang.org/docs/handbook/2/objects.html), [primitive type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean) or an [array](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays) (in bracket syntax).
- `dci-lint/no-this-in-context` - Disallows `this` in Contexts.
- `dci-lint/private-role-access` - Private RoleMethods and Role contracts can only be accessed within their own Roles.

### Warnings

These rules are optional, but only turn them off if you have a good reason.

- `dci-lint/immutable-roles` - Prevents reassigning of Roles. Can be turned off if you don't assign Roles directly in the Context parameters, instead binding (assigning) them elsewhere in the Context.
- `dci-lint/uppercase-roles` - Roles must be uppercased. Can be turned off if you think it looks horrendous, but it's rather useful to quickly identify Roles, like in a movie script. Try it first. :)

## More information

Please dive into [fulloo.info](https://fulloo.info/) and its extensive documentation. The [trygve manual](https://fulloo.info/Documents/trygve/trygve1.html) on that site is a worthwhile read for any programmer regardless of skill level.

## Comments, ideas, issues

Are best expressed as a Github issue [here](https://github.com/ciscoheat/eslint-plugin-dci-lint/issues)!

## Thanks

Thanks to the [Typescript ESLint project](https://typescript-eslint.io/) for making this possible at all!

And as always, a big thanks to Trygve Reenskaug and James Coplien for inventing and continously improving on DCI over the years.
