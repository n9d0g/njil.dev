<script lang="ts">
	export let link: string;
</script>

<a
	class="no-underline dark:text-[var(--colour-text-dark)]"
	href={link}
	target="_blank"
	rel="noreferrer"
>
	<button>
		<slot />
	</button>
</a>

<style>
	a {
		color: var(--colour-text);
		transition: 0.3s;
	}

	a:hover {
		color: var(--colour-theme-1);
	}
</style>
