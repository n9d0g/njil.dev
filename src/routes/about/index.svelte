<script context="module">
	import { browser, dev } from '$app/env';
	import { fade, slide } from 'svelte/transition';

	// we don't need any JS on this page, though we'll load
	// it in dev so that we get hot module replacement...
	export const hydrate = dev;

	// ...but if the client-side router is already loaded
	// (i.e. we came here from elsewhere in the app), use it
	export const router = browser;

	// since there's no dynamic data here, we can prerender
	// it so that it gets served as a static asset in prod
	export const prerender = true;
</script>

<svelte:head>
	<title>about</title>
</svelte:head>

<div class="content" in:fade={{ duration: 1000 }}>
	<h1 in:slide={{ delay: 250 }}>about me</h1>
	<p in:fade={{ delay: 500 }}>
		I graduated from <span>Conestoga College</span> in Spring 2021 with an Advanced Diploma in
		<span>Software Engineering Technology.</span>
		Since then, I've been working as a software developer with a focus in web development.
	</p>

	<p in:fade={{ delay: 1500 }}>
		I'm currently a software developer at <span>Leon's Furniture Limited</span>, where I help
		maintain and update multiple full-fledged Shopify sites using HTML, CSS, JavaScript, and jQuery.
	</p>

	<p in:fade={{ delay: 2500 }}>
		My goal is to always improve and hone my skills as a developer, while also cultivating an eye
		for creative, intuitive, and clean design. I thoroughly enjoy exploring and keeping up to date
		with new web technologies to push the limits of the ever-changing software development industry.
	</p>

	<p in:fade={{ delay: 3500 }}>
		When I'm not coding, I love a nice game of chess, playing basketball, and making/creating music.
	</p>

	<p in:fade={{ delay: 4500 }}>
		Feel free to reach out to me at <span>nathanjlardizabal@gmail.com</span>! I'd love to connect
		with you whether professionally or casually.
	</p>

	<a href="/about/n9d0g" in:fade={{ delay: 5500 }}>
		<h3>what's with the name "n9d0g?"</h3>
	</a>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	p {
		font-size: 1.3rem;
	}

	span {
		text-decoration: underline;
		color: var(--accent-color);
	}

	a {
		display: flex;
		justify-content: flex-end;
	}

	h3 {
		font-weight: 400;
	}

	@media (max-width: 60em) {
		.content {
			margin: 0 auto;
		}
	}
</style>
