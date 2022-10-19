<script>
	import lodash from 'lodash';
	const { get } = lodash;
	export let name;
	export let errors;

	const error = get($errors, name);
</script>

{#if error}
	<small>{error}</small>
{/if}
