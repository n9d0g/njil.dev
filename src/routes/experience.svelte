<script context="module">
	import { browser, dev } from '$app/env';
	import Job from '$lib/job/Job.svelte';
	import { experience } from '../data/experience.js'
	import { fade } from 'svelte/transition';

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
	<title>work experience</title>
</svelte:head>

<div class="content" in:fade={{ duration: 1000 }}>
	<h1>my work experience</h1>
	{#each experience as exp}
	 <div in:fade={{ delay: 500 }}>
		<Job title={exp.title} company={exp.company} location={exp.location} 
			dateStart={exp.dateStart} dateEnd={exp.dateEnd} 
			points={exp.points} />
	 </div>
	{/each}
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	@media (max-width: 60em) {
		.content {
			justify-content: flex-start;
			margin: 0 auto;
		}
	}
</style>
