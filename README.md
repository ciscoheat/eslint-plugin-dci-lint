# eslint-plugin-dci

Helps you adhere to DCI conventions.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-dci`:

```sh
npm install eslint-plugin-dci --save-dev
```

## Usage

Add `dci` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "dci"
    ]
}
```


Then configure the rules you want to use under the rules section.

```json
{
    "rules": {
        "dci/rule-name": 2
    }
}
```

## Supported Rules

* Fill in provided rules here


