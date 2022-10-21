<script lang="ts">
	import lodash from 'lodash';
	const { get } = lodash;
	export let name: string;
	export let errors;

	$: error = get($errors, name);
</script>

{#if error}
	<small class="text-danger">{error}</small>
{/if}
