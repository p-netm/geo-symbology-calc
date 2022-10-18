<script lang="ts">
	import { createForm } from 'svelte-forms-lib';
	import {
		defaultPriorityConfig,
		generateFilledData,
		initialValues,
		type FormFields,
		PriorityLevel
	} from './utils';

	const preDeterminedPriorityLevels = Object.values(PriorityLevel);

	$: generatedJson = '{}';

	const { form, errors, handleChange, handleSubmit } = createForm({
		initialValues,
		validationSchema: undefined,
		onSubmit: (values) => {
			const filled = generateFilledData(values);
			generatedJson = JSON.stringify(filled, null, 2);
		}
	});

	const addPriorityLevel = () => {
		$form.symbolConfig = $form.symbolConfig.concat(defaultPriorityConfig);
		$errors.symbolConfig = $errors.symbolConfig.concat(defaultPriorityConfig);
	};

	const removePriorityLevel = (i: number) => () => {
		$form.symbolConfig = $form.symbolConfig.filter((_, idx) => idx !== i);
		$errors.symbolConfig = $errors.symbolConfig.filter((_, idx: number) => idx !== i);
	};

	const addColorCodeConfig = (i: number) => () => {
		$form.symbolConfig[i].symbologyOnOverflow = $form.symbolConfig[i].symbologyOnOverflow.concat({
			overFlowDays: undefined,
			color: ''
		});
		$errors.symbolConfig[i].symbologyOnOverflow = $errors.symbolConfig[
			i
		].symbologyOnOverflow.concat({
			overFlowDays: undefined,
			color: ''
		});
	};

	const removeColorCodeConfig =
		(priorityLevelIdx: number) => (symbologyOnOverFlowIdx: number) => () => {
			$form.symbolConfig[priorityLevelIdx].symbologyOnOverflow = $form.symbolConfig[
				priorityLevelIdx
			].symbologyOnOverflow.filter((_, idx) => idx !== symbologyOnOverFlowIdx);
			$errors.symbolConfig[priorityLevelIdx].symbologyOnOverflow = $errors.symbolConfig[
				priorityLevelIdx
			].symbologyOnOverflow.filter((_: never, idx: number) => idx !== symbologyOnOverFlowIdx);
		};
</script>

<div class="row g-3 mx-auto">
	<div class="col-sm-6 col-md-8">
		<form class="form" on:submit={handleSubmit}>
			<div class="form-group row mb-2">
				<label for="regFormId" class="col-sm-3">Registration Form Id</label>
				<div class="col-sm-9">
					<input
						type="text"
						id="regFormId"
						class="form-control"
						name={`formPair.regFormId`}
						on:change={handleChange}
						bind:value={$form.formPair.regFormId}
					/>
					{#if $errors.formPair.regFormId}
						<small>{JSON.stringify($errors.formPair.regFormId)}</small>
					{/if}
				</div>
			</div>
			<div class="form-group row mb-2">
				<label for="visitFormId" class="col-sm-3">Visit Form Id</label>
				<div class="col-sm-9">
					<input
						type="text"
						id="visitFormId"
						class="form-control"
						name={`formPair.visitFormId`}
						on:change={handleChange}
						bind:value={$form.formPair.visitFormId}
					/>
					<!-- TODO - dry out as Message Component -->
					{#if $errors.formPair.visitFormId}
						<small>{$errors.formPair.visitFormId}</small>
					{/if}
				</div>
			</div>
			<div class="form-group row mb-2">
				<label for="baseUrl" class="col-sm-3">Api base url</label>
				<div class="col-sm-9">
					<input
						id="baseUrl"
						type="url"
						class="form-control"
						on:change={handleChange}
						bind:value={$form.baseUrl}
					/>
				</div>
				{#if $errors.baseUrl}
					name="baseUrl"
					<small>{$errors.baseUrl}</small>
				{/if}
			</div>

			<div class="form-group row mb-2">
				<label for="apiToken" class="col-sm-3">Api token</label>
				<div class="col-sm-9">
					<input
						id="apiToken"
						name="apiToken"
						type="text"
						disabled
						class="form-control"
						bind:value={$form.apiToken}
					/>
				</div>
				{#if $errors.apiToken}
					<small>{$errors.apiToken}</small>
				{/if}
			</div>

			<div class="form-group row mb-2">
				<label for="schedule" class="col-sm-3">Schedule</label>
				<div class="form-group col-sm-9 row mb-2">
					<div>
						<span>
							Schedule is a cron expression made of five fields. Each field can have the following values.
						</span>
						<table class="table table-sm table-bordered table-striped">
							<thead><tr><th>*</th><th>*</th><th>*</th><th>*</th><th>*</th></tr></thead><tbody
								><tr
									><td>minute <br> (0-59)</td><td>hour<br> (0 - 23)</td><td>day of the month<br> (1 - 31)</td><td
										>month<br> (1 - 12)</td
									><td>day of the week<br> (0 - 6)</td></tr
								></tbody
							>
						</table>
						<span>
							You can use this online generation tool: <a
								href="https://crontab.cronhub.io/"
								target="_blank">crontab</a
							>
						</span>
						<input
							id="schedule"
							name="schedule"
							type="text"
							class="form-control"
							bind:value={$form.schedule}
						/>

						{#if $errors.schedule}
							<small>{$errors.schedule}</small>
						{/if}
					</div>
				</div>
			</div>

			<div class="form-group row">
				<label for="symbol-configs" class="col-sm-3">Symbol config</label>
				<fieldset class="col-sm-9">
					{#each $form.symbolConfig as _, i}
						<div class="card mb-2">
							<div class="card-header">Add color code for single priorityLevel</div>
							<div class="card-body">
								<div class="form-group row mb-2">
									<label for="baseUrl" class="col-sm-3">Priority Level</label>
									<div class="col-sm-9">
										<select
											name={`symbolConfig${i}.priorityLevel`}
											id={`symbolConfig${i}.priorityLevel`}
											class="form-select"
											bind:value={$form.symbolConfig[i].priorityLevel}
											>{#each preDeterminedPriorityLevels as priorityLevel}
												<option>{priorityLevel}</option>
											{/each}
										</select>
									</div>
									<!-- {#if $errors.symbolConfig[i].priorityLevel}
										<small>{$errors.symbolConfig[i].priorityLevel}</small>
									{/if} -->
								</div>

								<div class="form-group row mb-2">
									<label for={`symbolConfig${i}.frequency`} class="col-sm-3">Frequency</label>
									<div class="col-sm-9">
										<input
											name={`symbolConfig${i}.frequency`}
											id={`symbolConfig${i}.frequency`}
											type="number"
											class="form-control"
											bind:value={$form.symbolConfig[i].frequency}
										/>
									</div>
									<!-- {#if $errors.symbolConfig[i].frequency}
										<small>{$errors.symbolConfig[i].frequency}</small>
									{/if} -->
								</div>

								<div class="form-group row">
									<label for="symbol-configs" class="col-sm-3">Color Codes:</label>
									<div id="symbol-configs" class="col-sm-9 mb-2">
										{#each $form.symbolConfig[i].symbologyOnOverflow as _, j}
											<div class="card mb-2">
												<div class="card-body ">
													<div class="row mb-2">
														<label
															class="form-label col-sm-6"
															for={`symbolConfig[${i}].symbologyOnOverflow[${j}].overFlowDays`}
															>OverFlow days</label
														>
														<div class="col-sm-6">
															<input
																type="number"
																class="form-control"
																name={`symbolConfig[${i}].symbologyOnOverflow[${j}].overFlowDays`}
																id={`symbolConfig[${i}].symbologyOnOverflow[${j}].overFlowDays`}
																bind:value={$form.symbolConfig[i].symbologyOnOverflow[j]
																	.overFlowDays}
															/>
														</div>
													</div>
													<div class="row mb-2">
														<label
															for={`symbolConfig[${i}].symbologyOnOverflow[${j}].color`}
															class="form-label col-sm-6">Color</label
														>
														<div class="col-sm-6">
															<input
																type="color"
																class="form-control form-control-color"
																name={`symbolConfig[${i}].symbologyOnOverflow[${j}].color`}
																id={`symbolConfig[${i}].symbologyOnOverflow[${j}].color`}
																title="Pick color"
																bind:value={$form.symbolConfig[i].symbologyOnOverflow[j].color}
															/>
														</div>
													</div>

													<div class="">
														{#if j === $form.symbolConfig[i].symbologyOnOverflow.length - 1}
															<button
																class="btn btn-sm btn-outline-primary"
																on:click={addColorCodeConfig(i)}>+</button
															>
														{/if}
														{#if $form.symbolConfig[i].symbologyOnOverflow.length !== 1}
															<button
																class="btn btn-sm btn-outline-danger"
																on:click={removeColorCodeConfig(i)(j)}>-</button
															>
														{/if}
													</div>
												</div>
											</div>
										{/each}
									</div>
								</div>
							</div>
							<div class="card-footer">
								{#if i === $form.symbolConfig.length - 1}
									<button
										on:click={addPriorityLevel}
										type="button"
										class="btn btn-sm btn-outline-primary">+ Add another priority level</button
									>
								{/if}
								{#if $form.symbolConfig.length !== 1}
									<button
										on:click={removePriorityLevel(i)}
										type="button"
										class="btn btn-sm btn-outline-danger">- Remove this priority level</button
									>
								{/if}
							</div>
						</div>
					{/each}
				</fieldset>
			</div>

			<div class="text-center">
				<button type="submit" class="btn btn-primary">Generate Json</button>
			</div>
		</form>
	</div>
	<aside class="col-6 col-md-4">
		<pre>{generatedJson}</pre>
		<div class="text-center">
			<button class="btn btn-primary" on:click={() => {navigator.clipboard.writeText(generatedJson); alert("config copied to clipboard")}}
				>Copy Config</button
			>
		</div>
	</aside>
</div>
