import { error } from '@sveltejs/kit';
import { getAllSymbologyConfigs } from '$lib/server/appConfig';
import { keyBy } from 'lodash-es';
import { evaluate, type Config } from '@onaio/symbology-calc-core';

/** @type {import('./$types').RequestHandler} */
export function GET({ url }) {
	const baseUrl = url.searchParams.get('baseUrl') ?? '';
	const regFormId = url.searchParams.get('regFormId') ?? '';
	const visitFormId = url.searchParams.get('visitFormId') ?? '';

	const createStringKey = (baseUrl: string, regFormId: string, visitFormId: string) =>
		`${baseUrl}-${regFormId}-${visitFormId}`;

	const associatedConfigs: Record<string, Config> = keyBy(getAllSymbologyConfigs(), (config) => {
		const { baseUrl, formPair } = config;
		return createStringKey(baseUrl, formPair.regFormId, formPair.visitFormId);
	});

	const configKeyOfInterest = createStringKey(baseUrl, regFormId, visitFormId);

	const configOfInterest = associatedConfigs[configKeyOfInterest];
	if (!configOfInterest) {
		throw error(500, 'Oops, something went wrong while trying to load config');
	}

	evaluate(configOfInterest);
	return new Response(JSON.stringify({ message: 'Pipeline triggered asynchronously' }));
}
