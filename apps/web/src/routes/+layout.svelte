<script>
	import { SvelteToast } from '@zerodevx/svelte-toast';
</script>

<nav class="navbar navbar-expand-lg navbar-light bg-light">
	<div class="container-fluid">
		<a class="navbar-brand" href="/">Geo Symbology Transform</a>
		<button
			class="navbar-toggler"
			type="button"
			data-bs-toggle="collapse"
			data-bs-target="#navbarNav"
			aria-controls="navbarNav"
			aria-expanded="false"
			aria-label="Toggle navigation"
		>
			<span class="navbar-toggler-icon" />
		</button>
		<div class="collapse navbar-collapse " id="navbarNav">
			<ul class="navbar-nav">
				<li class="nav-item">
					<a class="nav-link" href="/configs">Create Config</a>
				</li>
				<li class="nav-item">
					<a class="nav-link" href="/workflows">Workflows</a>
				</li>
			</ul>
		</div>
	</div>
</nav>

<div class="container py-3">
	<slot />
</div>
<SvelteToast />
