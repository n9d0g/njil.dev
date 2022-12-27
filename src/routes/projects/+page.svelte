<script>
	import Project from '$lib/components/Project.svelte';
	import { projects } from '$lib/data/projects';
</script>

<svelte:head>
	<title>n9 | projects</title>
</svelte:head>

<section class="flex flex-col container justify-center items-center p-8">
	<h1 class="text-5xl mb-4">n9's projects</h1>
	<div class="grid container max-w-xl grid-cols-1 md:grid-cols-2 gap-4">
		{#each projects as project}
			<Project
				hrefLink={project.href}
				alt={project.alt}
				img={project.img}
				title={project.title}
				description={project.description}
			/>
		{/each}
	</div>
</section>
