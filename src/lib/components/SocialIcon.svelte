<script lang="ts">
	export let link: string;
	export let aria: string;
</script>

<button aria-label={aria}>
	<a
		class="no-underline dark:text-[var(--colour-text-dark)]"
		href={link}
		target="_blank"
		rel="noreferrer"
		aria-label={aria}
	>
		<slot />
	</a>
</button>

<style>
	a {
		color: var(--colour-text);
		transition: 0.3s;
	}

	a:hover {
		color: var(--colour-theme-1);
	}
</style>
