<script lang="ts">
	import type { PageData } from './$types';
	import { range } from 'lodash-es';
	import { convertCronToHuman, parseForTable } from './utils';
	import PageHeader from '$lib/shared/components/PageHeader.svelte';
	import { goto } from '$app/navigation';
	import { toast } from '@zerodevx/svelte-toast'

	export let data: PageData;

	const manualTrigger = async (uuid: string) => {
		const sParams = new URLSearchParams({
			uuid
		});
		const fullUrl = `/workflows/run?${sParams.toString()}`;
		return await fetch(fullUrl)
			.then(() => {
				toast.push(
					'Pipeline triggered manually and is running asyncronously, Please note: This does not mean the pipeline executed successfully'
				);
			})
			.catch((err) => {
				toast.push(err.message);
			});
	};

	const editTrigger = async (uuid: string) => {
		const sParams = new URLSearchParams({
			uuid,
		});
		const fullUrl = `/configs?${sParams.toString()}`;
		goto(fullUrl);
	};

	const deleteTrigger = async (uuid: string) => {
		const sParams = new URLSearchParams({
			uuid,
		});
		const fullUrl = `/configs?${sParams.toString()}`;
		return await fetch(fullUrl, {
			method: 'DELETE'
		})
			.then(() => {toast.push("Config deleted.")})
			.catch((err) => {
				toast.push(err.message);
			}).finally(() => {
				window.location.reload()	
			});
	};


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
			<div class="card my-3">
				<div class="card-header d-flex justify-content-end gap-2">
					<button
						on:click={() =>
							manualTrigger(config.uuid)}
						class="btn btn-outline-primary btn-sm"
						><i class="fas fa-cogs" /> Manually Trigger workflow</button
					>
					<button
						on:click={() =>
							editTrigger(config.uuid)}
						class="btn btn-outline-primary btn-sm"><i class="fas fa-edit" /> Edit</button
					>
					<button
						on:click={() =>
							deleteTrigger(config.uuid)}
						class="btn btn-outline-danger btn-sm"
					>
						<i class="fas fa-trash" /> Delete
					</button>
				</div>
				<div class="card-body">
					<dl class="row">
						<dt class="col-sm-3">API Base url</dt>
						<dd class="col-sm-9">{config.baseUrl}</dd>
						<dt class="col-sm-3">Registration form Id</dt>
						<dd class="col-sm-9">{config.formPair.regFormId}</dd>
						<dt class="col-sm-3">Visit form Id</dt>
						<dd class="col-sm-9">{config.formPair.visitFormId}</dd>
					</dl>
					<div class="text-center">
						<table class="table table-bordered table-sm table-hover text-center">
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
				</div>
			</div>
		{/each}
	</main>
{/if}
