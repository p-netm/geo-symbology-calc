import importFresh from 'import-fresh';
import type { IConfig } from 'config';
import { basename } from 'node:path';
import { allSymbolConfigsAccessor } from '$lib/server/constants';

export const getConfig = (key: string, defualt?: unknown, getFromDefaultToo = true) => {
	try {
		const config: IConfig = importFresh('config');

		const sources = config.util.getConfigSources();
		const localSource = sources.filter((source) => basename(source.name) === 'local.json')[0];

		// if only default then return default
		if (!getFromDefaultToo) {
			if (localSource?.parsed[allSymbolConfigsAccessor] === undefined) {
				if (defualt !== undefined) {
					return defualt;
				} else {
					throw new Error(`${key} was not found in the ${localSource.name}`);
				}
			}
		}
		const value = config.get(key);
		return value;
	} catch (err) {
		if (defualt !== undefined) {
			return defualt;
		}
		throw err;
	}
};
