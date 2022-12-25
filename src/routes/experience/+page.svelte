<script lang="ts">
	import { experience } from '$lib/data/experience';

	let experiences = experience;
</script>

<svelte:head>
	<title>n9 | experience</title>
</svelte:head>

<section class="flex flex-col justify-center items-center p-6 max-w-2xl my-0 mx-auto">
	<h1>n9's experience</h1>
	{#each experiences as exp}
		<article class="flex flex-col  w-full mb-4">
			<div class="flex flex-col">
				<h2 class="font-bold">{exp.title}</h2>
				<p class="italic">{exp.location} | {exp.start} - {exp.end}</p>
			</div>
			<div class="flex justify-start">
				<ul class="pl-4">
					{#each exp.description as point}
						<li class="list-disc">{point}</li>
					{/each}
				</ul>
			</div>
		</article>
	{/each}
</section>
