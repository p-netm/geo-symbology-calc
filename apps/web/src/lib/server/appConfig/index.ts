import { validateConfigs } from '@onaio/symbology-calc-core/src/utils';
import type { SingleApiSymbolConfig } from 'src/lib/shared/types';
import { geoSymbolLogger } from '../logger/winston';
import importFresh from 'import-fresh';
import type { IConfig } from 'config';
import { basename } from 'node:path';
import { allSymbolConfigsAccessor } from '$lib/server/constants';
import { uniqWith } from 'lodash-es';
import yup from 'yup';
import type { Config } from '@onaio/symbology-calc-core';

export const getConfig = (key: string, defualt?: unknown, getFromDefaultToo = true) => {
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

export function webValidateConfigs(config: Config) {
	const extraSchema = yup.object().shape({
		uuid: yup.string().uuid().required('Symbology config does not have a uuid')
	});

	validateConfigs(config);
	extraSchema.validateSync(config);
}

export function getAllSymbologyConfigs() {
	const rawSymbologyConfigs = getConfig(
		allSymbolConfigsAccessor,
		[],
		false
	) as SingleApiSymbolConfig[];
	const allSymbologyConfigs = rawSymbologyConfigs.map((config) => {
		return {
			...config,
			logger: geoSymbolLogger
		};
	});
	allSymbologyConfigs.forEach(webValidateConfigs);
	const uniqAllSymbolConfigs = uniqWith(allSymbologyConfigs, (config1, config2) => {
		return config1.uuid === config2.uuid;
	});

	return uniqAllSymbolConfigs;
}

export function getClientSideSymbologyConfigs() {
	const allSymbologyConfigs = getAllSymbologyConfigs();
	return (allSymbologyConfigs ?? []).map((symbologyConfig: SingleApiSymbolConfig) => {
		const { baseUrl, formPair, symbolConfig, schedule, uuid } = symbologyConfig;
		return { baseUrl, formPair, symbolConfig, schedule, uuid };
	});
}
