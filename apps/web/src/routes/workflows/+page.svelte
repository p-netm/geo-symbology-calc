<script lang="ts">
	import type { PageData } from './$types';
	import { range } from 'lodash';
	import { parseForTable } from './utils';
	import cronstrue from 'cronstrue';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';

	export let data: PageData;

	const manualTrigger = async (baseUrl: string, regFormId: string, visitFormId: string) => {
		const sParams = new URLSearchParams({
			baseUrl,
			regFormId,
			visitFormId
		});
		const fullUrl = `/workflows/run?${sParams.toString()}`;
		return await fetch(fullUrl)
			.then(() => {
				alert(
					'pipeline triggered manually, Please note: This does not mean the pipeline executed successfully'
				);
			})
			.catch((err) => {
				alert(err.message);
			});
	};

	function convertCronToHuman(cronString: string) {
		const cronstrueOptions = {
			verbose: true,
			use24HourTimeFormat: true
		};
		try {
			return cronstrue.toString(cronString, cronstrueOptions);
		} catch (err) {
			return '';
		}
	}
</script>

{#if data.configs.length === 0}
	<main>
		<PageHeader pageTitle="Configured Pipeline list" />
		<div class="card">
			<div class="card-body">
				<span class="text-danger">No Pipeline configurations were detected.</span>
			</div>
		</div>
	</main>
{:else}
	<main>
		<PageHeader pageTitle="Configured Pipeline list" />
		{#each data.configs as config}
			{@const { tableHeaders, tableRows, colorsColSpan } = parseForTable(config)}
			<div class="card text-center my-3">
				<div class="card-header">
					Color symbology config for: {config.baseUrl}
				</div>
				<div class="card-body">
					<table class="table table-bordered table-sm table-hover">
						<thead>
							<tr>
								{#each tableHeaders as header, i}
									{#if i === tableHeaders.length - 1}
										<th scope="col" colspan={colorsColSpan}>{header}</th>
									{:else}
										<th scope="col">{header}</th>
									{/if}
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each tableRows as row}
								<tr>
									{#each range(colorsColSpan + (tableHeaders.length - 1)) as idx}
										{@const thisElement = row[idx]}
										{#if thisElement === undefined}
											<td />
										{:else if Array.isArray(thisElement)}
											<td style={`background-color: ${thisElement[1]}`}
												><span class="fw-bolder">{thisElement[0]}</span></td
											>
										{:else}
											<td>{thisElement}</td>
										{/if}
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
					<span class="card-text d-inline-block me-2 text-muted">Schedule:</span><span
						class="card-text">{convertCronToHuman(config.schedule)}</span
					>
				</div>
				<div class="card-footer">
					<button
						on:click={() =>
							manualTrigger(config.baseUrl, config.formPair.regFormId, config.formPair.visitFormId)}
						class="btn btn-outline-primary btn-sm">Manually Trigger workflow</button
					>
				</div>
			</div>
		{/each}
	</main>
{/if}
