<script>
	import HeaderItem from './HeaderItem.svelte';
	import BurgerMenu from '$lib/icons/BurgerMenu.svelte';
	import Sun from '$lib/icons/Sun.svelte';
	import Moon from '$lib/icons/Moon.svelte';
	import { lightTheme } from '../../stores/store';

	function changeTheme() {
		lightTheme.update((theme) => !theme);
	}
</script>

<header class="flex relative justify-end md:justify-center p-4">
	<!-- desktop -->
	<nav class="flex justify-center">
		<ul class="hidden md:flex relative justify-center items-center list-none bg-contain p-0 m-0">
			<HeaderItem hrefLink="/" link="home" />
			<HeaderItem hrefLink="/about" link="about" />
			<HeaderItem hrefLink="/experience" link="experience" />
			<HeaderItem hrefLink="/projects" link="projects" />
		</ul>
	</nav>
	<!-- mobile -->
	<nav class="fixed flex gap-2 backdrop-blur-sm">
		<button
			on:click={changeTheme}
			class="flex justify-self-right md:hidden py-2 px-4 border rounded"
		>
			{#if $lightTheme}
				<Sun />
			{:else}
				<Moon />
			{/if}
		</button>
		<button class="flex justify-self-right md:hidden py-2 px-4 border rounded">
			<BurgerMenu />
		</button>
	</nav>
</header>

<style>
	ul {
		background: var(--background);
	}
</style>
