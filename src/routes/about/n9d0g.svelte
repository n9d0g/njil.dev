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
	<title>n9d0g</title>
</svelte:head>

<div class="content" in:fade={{ duration: 1000 }}>
	<h1 in:slide={{ delay: 250 }}>n9d0g?</h1>
  <p>
    The tag/username comes from a time when I was playing JackBox with my church friends many years ago. 
    For most of my life whenever creating usernames, I would shorten "Nate Dog" to "n8dog" - except this time,
    my finger slipped up and pressed the 9 instead of the 8 🤦 All of my friends laughed at me, but I stuck with
    it over time. Throughout the years, the 'o' changed into a '0', and there you have it! 
  </p>
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
		justify-content: right;
	}

	h3 {
		font-weight: 400;
	}
</style>
