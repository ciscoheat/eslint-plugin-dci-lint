# eslint-plugin-dci-lint

Helps you adhere to DCI conventions. For more information about the DCI (Data, Context and Interaction) paradigm, see [https://fulloo.info](https://fulloo.info).

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-dci-lint`:

```sh
npm install eslint-plugin-dci-lint --save-dev
```

## Usage

Add `dci-lint` to the extends section of your `.eslintrc` configuration file:

```json
{
  "extends": ["plugin:dci-lint/recommended"]
}
```

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
