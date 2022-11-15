import { validateConfigs } from '@onaio/symbology-calc-core/src/utils';
import type { SingleApiSymbolConfig } from 'src/lib/shared/types';
import { geoSymbolLogger } from '../logger/winston';
import importFresh from 'import-fresh';
import type { IConfig } from 'config';

export const getConfig = (key: string, defualt?: unknown) => {
	const config: IConfig = importFresh('config');
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
	const rawSymbologyConfigs = getConfig('allSymbologyConfigs') as SingleApiSymbolConfig[];
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
