import { resolve } from 'node:path';

// TODO - hack: the folders and mungled up during build thus making the relative urls not consistently during dev and production.
const defaultConfigDir = new URL(
	import.meta.env.PROD ? '../../../../../web/config' : '../../../../../apps/web/config',
	import.meta.url
).pathname;

export const configDir = process.env['NODE_CONFIG_DIR'] ?? defaultConfigDir; // TODO - should we check that local.json is provided as an invariant.
export const defaultConfigFile = resolve(configDir, 'default.json');
export const localConfigFile = resolve(configDir, 'local.json');

export const allSymbolConfigsAccessor = 'allSymbolConfigs';
