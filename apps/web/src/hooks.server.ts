import { allSymbologyConfigs } from '$lib/server/appConfig';
import { transformOnSchedule } from '@onaio/symbology-calc-core';

function startPreconfiguredPipelins() {
	allSymbologyConfigs.forEach((configSet) => {
		try {
			transformOnSchedule(configSet);
		} catch (error) {
			// log config that failed to run
		}
	});
}

startPreconfiguredPipelins();
