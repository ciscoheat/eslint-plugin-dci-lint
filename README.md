# eslint-plugin-dci-lint

This is a **TypeScript** ESLint plugin that helps you adhere to DCI conventions. For more information about DCI (Data, Context and Interaction), read [this introduction](https://blog.encodeart.dev/dci-tutorial-for-typescript-part-1).

## Installation

**Note:** Version 0.9+ of the plugin uses ESLint 9 and ESM.

Use `npm` or `pnpm` to install the plugin and its required packages:

```sh
npm i -D eslint @eslint/js typescript typescript-eslint eslint-plugin-dci-lint
```

```sh
pnpm i -D eslint @eslint/js typescript typescript-eslint eslint-plugin-dci-lint
```

## Configuration

Add the `dci-lint` plugin and the typescript parser to your `eslint.config.js` configuration file:

```js
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import dciLint from "eslint-plugin-dci-lint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  dciLint.configs.recommended,
  {
    rules: {
      //"dci-lint/literal-role-contracts": "off"
    },
  }
);
```

## Linting the code

In the project directory, you can run ESLint with `npx eslint .` but while coding it's best to use it with a code editor. This [VS Code extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) gives you linting as you type (or search for ESLint in the extensions panel).

## How to use / DCI Tutorial

A comprehensive tutorial series is available at [https://blog.encodeart.dev/dci-tutorial-for-typescript-part-1](https://blog.encodeart.dev/dci-tutorial-for-typescript-part-1).

## Supported Rules

### Required

These rules should not be turned off. [Let me know](https://github.com/ciscoheat/eslint-plugin-dci-lint/issues) if you have a good reason to do so.

| Rule                           | Usage                                                                               |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `dci-lint/atomic-role-binding` | All RoleMethods must be bound (assigned) in the same function.                      |
| `dci-lint/grouped-rolemethods` | RoleMethods must be grouped together, without unrelated code between them.          |
| `dci-lint/no-this-in-context`  | Disallows `this` in Contexts.                                                       |
| `dci-lint/private-role-access` | Private RoleMethods and Role contracts can only be accessed within their own Roles. |

### Optional

These rules are optional but are set to `warn` as default.

| Rule                              | Usage                                                                                                                                                                                                                                                                                                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dci-lint/literal-role-contracts` | Role contracts should be defined as an [object type](https://www.typescriptlang.org/docs/handbook/2/objects.html), [primitive type](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#the-primitives-string-number-and-boolean) or an [array](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#arrays) (in bracket syntax). |

Turning this rule off can undermine the readability of the Context by requiring knowledge about types defined elsewhere in the code, but it can be convenient if you're working with a standardized API like the W3C web standards.

Additionally, a few other standard types are allowed as non-literal types for Roles:

`Iterable` | `Array` | `Map` | `Set` | `Readonly` | `NonNullable` | `Awaited`

### Disabled

These rules are optional and are disabled as default.

| Rule                          | Usage                                             |
| ----------------------------- | ------------------------------------------------- |
| `dci-lint/immutable-roles`    | Enforces all Roles to be `const`.                 |
| `dci-lint/sorted-rolemethods` | RoleMethods must be placed in alphabetical order. |

## More information

Please dive into [fulloo.info](https://fulloo.info/) and its extensive documentation. The [trygve manual](https://fulloo.info/Documents/trygve/trygve1.html) on that site is a worthwhile read for any programmer regardless of skill level.

## VS Code snippets

For VS Code, there are also some useful snippets in the [typescript.json](https://github.com/ciscoheat/eslint-plugin-dci-lint/blob/main/typescript.json) file in this repo. To use it:

- Go to `File > Preferences > Configure User Snippets`
- Choose TypeScript in the list
- Paste the contents of the file there.

You can now use the keywords "context", "role" and "rm" in `.ts` files to quickly generate Contexts, Roles and RoleMethods.

## Test example

Paste this code in a `.ts` file to test if the plugin works with the linter. An error, "Accessing Role contract outside its own RoleMethods" should appear.

```ts
/**
 * @DCI-context
 */
export function Test() {
  const FirstRole = { name: "Test" };

  function FirstRole_method() {
    return FirstRole.name;
  }

  console.log(FirstRole.name); // Accessing Role contract outside its own RoleMethods.
  return FirstRole_method();
}
```

## Comments, ideas, issues

Are best expressed as a Github issue [here](https://github.com/ciscoheat/eslint-plugin-dci-lint/issues)!

## Thanks

Thanks to the [Typescript ESLint project](https://typescript-eslint.io/) for making this possible at all!

And as always, a big thanks to the late Trygve Reenskaug for inventing DCI, and James Coplien for continously furthering it over the years.
