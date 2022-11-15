// send form payload to here
// get forms from here

import { localConfigFile } from '$lib/shared/constants';
import fs from 'node:fs';
import { json } from '@sveltejs/kit';
import { getAllSymbologyConfigs } from '$lib/server/appConfig';
import { keyBy } from 'lodash-es';

const generateKey = (baseUrl: string, regId: string, visitId: string) =>
	`${baseUrl}-${regId}-${visitId}`;

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	const payload = await request.json();
	const dataText = fs.readFileSync(localConfigFile);
	const data = JSON.parse(dataText);
	data.allSymbologyConfigs.push(payload);
	fs.writeFileSync(localConfigFile, JSON.stringify(data));
	return json({});
}

/** @type {import('./$types').RequestHandler} */
export async function PUT({ request }) {
	const payload = await request.json();
	const dataText = fs.readFileSync(localConfigFile);
	const data = JSON.parse(dataText);

	// TODO - repeated code.
	const clientSymbologyConfigs = getAllSymbologyConfigs();

	const configsByKeys = keyBy(clientSymbologyConfigs, (obj) => {
		return generateKey(obj.baseUrl, obj.formPair.regFormId, obj.formPair.visitFormId);
	});
	const configOfInterestKey = generateKey(payload.baseUrl, payload.regFormId, payload.visitFormId);
	const configOfInterest = configsByKeys[configOfInterestKey];

	const newConfig = {
		...configOfInterest,
		...payload
	};

	configsByKeys[configOfInterestKey] = newConfig;

	data.allSymbologyConfigs = Object.values(configsByKeys);
	fs.writeFileSync(localConfigFile, JSON.stringify(data));
	return json({});
}

/** @type {import('./$types').RequestHandler} */
export async function DELETE({ url }) {
	const baseUrl = url.searchParams.get('baseUrl') ?? '';
	const regFormId = url.searchParams.get('regFormId') ?? '';
	const visitFormId = url.searchParams.get('visitFormId') ?? '';

	const dataText = fs.readFileSync(localConfigFile);
	const data = JSON.parse(dataText);

	// TODO - repeated code.
	const allSymbologyConfigs = getAllSymbologyConfigs();
	const leftSymbolConfigs = allSymbologyConfigs.filter((obj) => {
		const tempKey = generateKey(obj.baseUrl, obj.formPair.regFormId, obj.formPair.visitFormId);
		const checkKey = generateKey(baseUrl, regFormId, visitFormId);
		return tempKey !== checkKey;
	});

	data.allSymbologyConfigs = leftSymbolConfigs;
	fs.writeFileSync(localConfigFile, JSON.stringify(data));
	return json({});
}
