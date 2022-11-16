import { validateConfigs } from '@onaio/symbology-calc-core/src/utils';
import type { SingleApiSymbolConfig } from 'src/lib/shared/types';
import { geoSymbolLogger } from '../logger/winston';
import importFresh from 'import-fresh';
import type { IConfig } from 'config';
import { basename } from 'node:path';
import { allSymbolConfigsAccessor } from '$lib/shared/constants';

export const getConfig = (key: string, defualt?: unknown, notDefault = false) => {
	const config: IConfig = importFresh('config');

	const sources = config.util.getConfigSources();
	const localSource = sources.filter((source) => basename(source.name) === 'local.json')[0];

	if (notDefault) {
		if (!localSource) {
			throw new Error(`Invariant: local.json config file was not found.`);
		}
		if (localSource.parsed[allSymbolConfigsAccessor] === undefined) {
			if (defualt !== undefined) {
				return defualt;
			} else {
				throw new Error(`Invariant: ${key} was not found in the ${localSource.name}`);
			}
		}
	}
	try {
		const value = config.get(key);
		return value;
	} catch (err) {
		if (defualt !== undefined) {
			return defualt;
		}
		throw err;
	}
};

export function getAllSymbologyConfigs() {
	const rawSymbologyConfigs = getConfig(
		allSymbolConfigsAccessor,
		[],
		true
	) as SingleApiSymbolConfig[];
	const allSymbologyConfigs = rawSymbologyConfigs.map((config) => {
		return {
			...config,
			logger: geoSymbolLogger
		};
	});
	allSymbologyConfigs.forEach(validateConfigs);

	return allSymbologyConfigs;
}

export function getClientSideSymbologyConfigs() {
	const allSymbologyConfigs = getAllSymbologyConfigs();
	return (allSymbologyConfigs ?? []).map((symbologyConfig: SingleApiSymbolConfig) => {
		const { baseUrl, formPair, symbolConfig, schedule } = symbologyConfig;
		return { baseUrl, formPair, symbolConfig, schedule };
	});
}
