# eslint-plugin-dci-lint

A typescript ESLint plugin that helps you adhere to DCI conventions. For more information about the DCI (Data, Context and Interaction) paradigm, see [https://fulloo.info](https://fulloo.info).

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

Add `dci-lint` and the typescript parser to the extends section of your `.eslintrc` configuration file:

**.eslintrc.cjs**

```js
module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
    'plugin:dci-lint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
};
```

## Running

In the project directory, you can run ESLint with `npx eslint .` but the recommended way is to use it with a code editor, for example [VS Code](https://code.visualstudio.com/). This [extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) gives you linting as you type (or search for ESLint in the extensions panel).

## Supported Rules

### Errors

These rules should not be turned off.

- `dci-lint/atomic-role-binding` - All RoleMethods must be bound (reassigned) in the same function. Not used if `dci-lint/immutable-roles` is enabled.
- `dci-lint/grouped-rolemethods` - RoleMethods must be grouped together, without unrelated code between them.
- `dci-lint/literal-role-contracts` - Role contracts can only be defined as literal objects, primitive types or arrays.
- `dci-lint/no-this-in-context` - Disallows `this` in Contexts.
- `dci-lint/private-role-access` - Private RoleMethods and Role contracts can only be accessed within their own Roles.

### Warnings

These rules are optional, but only turn them off if you have a good reason.

- `dci-lint/immutable-roles` - Prevents reassigning of Roles. Can be turned off if you don't assign Roles directly in the Context parameters, instead binding (assigning) them elsewhere in the Context.
- `dci-lint/uppercase-roles` - Roles must be uppercased. Can be turned off if you think it looks horrendous, but it's rather useful to quickly identify Roles, like in a movie script.
