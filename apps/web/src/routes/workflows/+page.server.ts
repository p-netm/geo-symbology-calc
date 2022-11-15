import { getClientSideSymbologyConfigs } from '$lib/server/appConfig';

/** @type {import('./$types').PageLoad} */
export function load() {
	const configs = getClientSideSymbologyConfigs();
	return {
		configs
	};
}
