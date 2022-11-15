import { getAllSymbologyConfigs } from '$lib/server/appConfig';
import { configDir } from '$lib/shared/constants';
import { evaluateOnSchedule } from '@onaio/symbology-calc-core';
import type { ScheduledTask } from 'node-cron';
import { watch } from 'node:fs/promises';

let tasks: ScheduledTask[] = [];

function startConfiguredPipelines() {
	tasks.map((task) => task.stop());
	tasks = [];
	getAllSymbologyConfigs().forEach((configSet) => {
		const task = evaluateOnSchedule(configSet);
		tasks.push(task);
	});
}

startConfiguredPipelines();

(async () => {
	const watcher = watch(configDir);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for await (const _event of watcher) {
		startConfiguredPipelines();
	}
})();
