<script>
	import HeaderItem from './HeaderItem.svelte';
</script>

<header class="flex justify-center py-4">
	<nav class="flex justify-center ">
		<ul class="flex relative justify-center items-center list-none bg-contain p-0 m-0">
			<HeaderItem hrefLink="/" link="home" />
			<HeaderItem hrefLink="/about" link="about" />
			<HeaderItem hrefLink="/experience" link="experience" />
		</ul>
	</nav>
</header>

<style>
	ul {
		background: var(--background);
	}
</style>
