import { getClientSideSymbologyConfigs } from '$lib/server/appConfig';
import { keyBy } from 'lodash-es';

/** @type {import('./$types').PageLoad} */
export function load({ url }) {
	const searchParam = new URLSearchParams(url.search);
	const baseUrl = searchParam.get('baseUrl') ?? '';
	const regFormId = searchParam.get('regFormId') ?? '';
	const visitFormId = searchParam.get('visitFormId') ?? '';
	if (!searchParam || !baseUrl || !visitFormId) {
		return { config: null };
	}
	const clientSymbologyConfigs = getClientSideSymbologyConfigs();
	const generateKey = (baseUrl: string, regId: string, visitId: string) =>
		`${baseUrl}-${regId}-${visitId}`;
	const configsByKeys = keyBy(clientSymbologyConfigs, (obj) => {
		return generateKey(obj.baseUrl, obj.formPair.regFormId, obj.formPair.visitFormId);
	});
	const configOfInterest = configsByKeys[generateKey(baseUrl, regFormId, visitFormId)];
	return { config: configOfInterest ?? null };
}
