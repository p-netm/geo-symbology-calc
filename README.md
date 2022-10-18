# Geo Symbology calc

This is an official Yarn (Berry) starter turborepo.

## What's inside?

This turborepo uses [Yarn](https://yarnpkg.com/) as a package manager. It includes the following packages/apps:

### Apps and Packages

- `web`: The GUI interface
- `core`: util that is able to pull form data and evaluates it according to configured business rules.
- `eslint-config-custom`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `tsconfig`: `tsconfig.json`s used throughout the monorepo

### Build

To build all apps and packages, run the following command:

```shell
# in root dir
yarn install
yarn build
```

### Develop

To develop all apps and packages, run the following command:

```shell
# in root dir
yarn install
yarn dev
```

### Configuration

The web app's configs are stored in the `apps/web/config` directory. There is a `default.json` file that you can use as a template. You can copy to a `local.json` file, modify the values to your liking and Run the app.
