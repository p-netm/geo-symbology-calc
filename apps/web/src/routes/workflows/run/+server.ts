import { error } from '@sveltejs/kit';
import { allSymbologyConfigs } from '$lib/server/config';
import lodash from 'lodash';
import { transform, type Config } from '@onaio/symbology-calc-core';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const baseUrl = url.searchParams.get('baseUrl') ?? '';
	const regFormId = url.searchParams.get('regFormId') ?? '';
	const visitFormId = url.searchParams.get('visitFormId') ?? '';

	const createStringKey = (baseUrl: string, regFormId: string, visitFormId: string) =>
		`${baseUrl}-${regFormId}-${visitFormId}`;

	const associatedConfigs: Record<string, Config> = lodash.keyBy(allSymbologyConfigs, (config) => {
		const { baseUrl, formPair } = config;
		return createStringKey(baseUrl, formPair.regFormId, formPair.visitFormId);
	});

	const configKeyOfInterest = createStringKey(baseUrl, regFormId, visitFormId);

	const configOfInterest = associatedConfigs[configKeyOfInterest];
	console.log({ configOfInterest, associatedConfigs, configKeyOfInterest });
	if (!configOfInterest) {
		throw error(500, 'Oops, something went wrong while trying to load config');
	}

	transform(configOfInterest);
	return new Response(JSON.stringify({ message: 'Pipeline triggered asynchronously' }));
}
