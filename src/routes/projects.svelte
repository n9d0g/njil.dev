<script context="module">
	import { browser, dev } from '$app/env';
	import { fade } from 'svelte/transition';
	import Project from '$lib/project/Project.svelte';
	import { projects } from '../data/projects.js'

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
	<title>projects</title>
</svelte:head>

<div class="content" in:fade={{ duration: 1000 }}>
	<h1>my projects</h1>
	<section class="container">
	{#each projects as project}
		<Project title={project.title} description={project.description} github={project.github} link={project.link} stack={project.stack} />
	{/each}

	</section>
</div>

<style>
	.content {
		width: 100%;
		max-width: var(--column-width);
		margin: var(--column-margin-top) auto 0 auto;
	}

	.container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-auto-rows: 1fr;
		gap: 1rem;
	}

	@media (max-width: 60em) {
		.content {
			margin: 0 auto;
			justify-content: flex-start;
		}

		.container {
			grid-template-columns: repeat(1, 1fr);
		}
	}
</style>
