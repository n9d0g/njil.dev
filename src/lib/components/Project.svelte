<script lang="ts">
	export let hrefLink: string;
	export let alt: string;
	export let img: any;
	export let title: string;
	export let description: string;
</script>

<button class="rounded-lg">
	<a
		class="flex flex-col gap-2 text-[var(--colour-text)] dark:text-[var(--colour-text-dark)]"
		href={hrefLink}
		target="_blank"
		rel="noreferrer"
	>
		<picture class="border w-full h-auto rounded-lg">
			<img src={img} {alt} />
		</picture>
		<div class="p-4">
			<h2 class="text-2xl font-semibold">{title}</h2>
			<p class="font-light">{description}</p>
		</div>
	</a>
</button>
