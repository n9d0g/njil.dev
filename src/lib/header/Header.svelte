<script>
	import { page } from '$app/stores';
	import { nav } from '../../data/nav.js'
</script>

<header>
	<!-- svelte-ignore component-name-lowercase -->
	<nav>
		<ul>
			{#each nav as navItem}
				<li class:active={$page.url.pathname === navItem.pathname}>
					<a sveltekit:prefetch href={navItem.pathname}>{navItem.text}</a>
				</li>
			{/each}
		</ul>
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	nav {
		display: flex;
		justify-content: center;
		--background: var(--primary-color);
	}

	ul {
		position: relative;
		padding: 0;
		margin: 0;
		height: 3em;
		display: flex;
		justify-content: center;
		align-items: center;
		list-style: none;
		background: var(--background);
		background-size: contain;
	}

	li {
		position: relative;
		height: 100%;
	}

	li.active::before {
		--size: 6px;
		content: '';
		width: 0;
		height: 0;
		position: absolute;
		top: 0;
		left: calc(50% - var(--size));
		border: var(--size) solid transparent;
		border-top: var(--size) solid var(--accent-color);
	}

	nav a {
		display: flex;
		height: 100%;
		align-items: center;
		padding: 0 1em;
		color: var(--heading-color);
		font-weight: 400;
		font-size: 1.2rem;
		text-transform: lowercase;
		letter-spacing: 0.02em;
		text-decoration: none;
		transition: 0.2s;
	}

	a:hover {
		color: var(--accent-color);
		text-decoration: underline;
		transform: translateY(-2.5%);
	}
</style>
