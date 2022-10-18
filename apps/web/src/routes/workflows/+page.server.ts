import { clientSideSymbologyConfigs } from '$lib/server/config';

/** @type {import('./$types').PageLoad} */
export function load() {
	return {
		configs: clientSideSymbologyConfigs
	};
}
