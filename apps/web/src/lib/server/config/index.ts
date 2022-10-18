import { validateConfigs } from '@onaio/symbology-calc-core/src/utils';
import config from 'config';
import type { SingleApiSymbolConfig } from 'src/lib/shared/types';

const allSymbologyConfigs = config.get('allSymbologyConfigs') as SingleApiSymbolConfig[];

allSymbologyConfigs.forEach(validateConfigs);

const clientSideSymbologyConfigs = (allSymbologyConfigs ?? []).map(
	(symbologyConfig: SingleApiSymbolConfig) => {
		const { baseUrl, formPair, symbolConfig, schedule } = symbologyConfig;
		return { baseUrl, formPair, symbolConfig, schedule };
	}
);

export { clientSideSymbologyConfigs, allSymbologyConfigs };
