<script context="module" lang="ts">
	export const prerender = true;
</script>

<svelte:head>
	<title>home</title>
</svelte:head>

<section>
	<h1>
		Hi!<br />My name is Nathan Lardizabal.
	</h1>

	<p>
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
	}
	p {
		font-size: 1.5rem;
	}
	span {
		color: var(--accent-colour);
	}
</style>