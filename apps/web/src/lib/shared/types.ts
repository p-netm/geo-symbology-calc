import type { Config } from '@onaio/symbology-calc-core';

export type SingleApiSymbolConfig = Config;

export type ClientSideSingleSymbolConfig = Pick<
	Config,
	'baseUrl' | 'formPair' | 'symbolConfig' | 'schedule'
>;
