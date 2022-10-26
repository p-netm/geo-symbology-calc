import { clientSideSymbologyConfigs } from '$lib/server/appConfig';

/** @type {import('./$types').PageLoad} */
export function load() {
	return {
		configs: [clientSideSymbologyConfigs]
	};
}
