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

- `dci-lint/literal-role-contracts` - Role contracts can only be defined as literal objects, primitive types or arrays.
- `dci-lint/no-this-in-context` - Disallows `this` in Contexts.
- `dci-lint/grouped-rolemethods` - RoleMethods must be grouped together.
- `dci-lint/private-role-access` - Private RoleMethods and Role contracts can only be accessed within their own Roles.
- `no-param-reassign` - From the [ESLint ruleset](https://eslint.org/docs/latest/rules/no-param-reassign). Prevents reassigning of Roles inside the Context.

### Warnings

These rules can be turned off.

- `dci-lint/uppercase-roles` - Roles must be uppercased.
