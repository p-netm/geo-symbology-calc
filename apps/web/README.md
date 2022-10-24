# Geo Symbology Transform web app

Web based graphical user interface that makes interacting with [@onaio/ymbology-calc-core](../../packages/core/) easier.
Contains 2 views:

1. Form view where one can create valid symbolConfigs
2. List view where one can see configured pipelines and optionally trigger any of the pipelines manually

## Developing

Once you've created a project and installed dependencies with `yarn`, start a development server:

```bash
yarn run dev

# or start the server and open the app in a new browser tab
yarn run dev -- --open
```

## Testing

Run the playwright e2e tests using

```bash
yarn run test
```

## Building

To create a production version of your app:

```bash
yarn run build
```

You can preview the production build with `yarn run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## envs and configuration

All configurations reside in the `config` folder. To add a pipeline as configuration you should

1. create a json config that represents the pipeline, you can do so
   1. manually by following the guide [here](../../packages/core/README.md#Symbol config).
   2. Running this web app, navigating to `/configs`, and filling out the form, you should then be able to copy the json
2. copy the `config/default.json` file to `config/local.json` and update the `"allSymbologyConfigs"` config prop
