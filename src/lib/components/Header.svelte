<script>
	import { page } from '$app/stores';
</script>

<header class="flex justify-center">
	<nav class="flex justify-center ">
		<ul class="flex relative justify-center items-center list-none bg-contain p-0 m-0">
			<li class="relative h-full" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
				<a
					class="flex h-full items-center py-0 px-2 font-bold text-sm uppercase tracking-wide no-underline transition"
					href="/"
				>
					Home
				</a>
			</li>
		</ul>
	</nav>
</header>

<style>
	ul {
		background: var(--background);
	}

	a:hover {
		color: var(--colour-theme-1);
	}
</style>
