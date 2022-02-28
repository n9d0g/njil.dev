<script context="module" lang="ts">
	export const prerender = true;
	import { fade } from 'svelte/transition'
</script>

<svelte:head>
	<title>home</title>
</svelte:head>

<section in:fade={{ duration: 1000 }}>
		<h1>
			<span in:fade={{ delay: 200 }}>Hi!</span>
			<br />
			<span in:fade={{ delay: 750 }}>My name is Nathan Lardizabal.</span>
		</h1>

		<p in:fade={{ delay: 1500 }}>
			I'm a front-end software developer primarily focused on building web applications with
			TypeScript and React.js ⚛ Currently, I am working as a software developer for <span
				>Leon's Furniture Limited</span
			> based in Toronto, ON 🇨🇦 In my free time, I enjoy a nice game of chess ♟️ playing basketball 🏀
			and making/creating music 🎵
		</p>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
		margin: var(--column-margin-top-home) auto 0 auto;
	}

	h1 {
		width: 100%;
		text-align: left;
		margin-top: 0;
	}

	p {
		width: 100%;
		font-size: 1.5rem;
	}

	span {
		color: var(--accent-colour);
	}

	@media (max-width: 60em) {
		section {
			justify-content: flex-start;
		}

		h1 {
			font-size: 2rem;
		}

		p {
			font-size: 1.3rem;
		}
	}
</style>