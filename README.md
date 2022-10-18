# Geo Symbology calc

This is an official Yarn (Berry) starter turborepo.

## What's inside?

This turborepo uses [Yarn](https://yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `web`: another [Svelte.js](https://kit.svelte.dev/) app
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```shell
# in root dir
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```shell
# in root dir
yarn dev
```

### Configuration

The web app's configs are stored in the `apps/web/config` directory. There is a `default.json` file that you can use as a template. You can copy to a `local.json` file, modify the values to your liking and Run the app.
