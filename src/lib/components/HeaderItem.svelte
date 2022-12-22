<script lang="ts">
	import { page } from '$app/stores';
	export let hrefLink: string;
	export let link: string;
</script>

<li class="relative h-full" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
	<a
		class="flex h-full items-center py-0 px-2 text-sm lowercase tracking-wide no-underline transition"
		href={hrefLink}
	>
		{link}
	</a>
</li>

<style>
	a {
		color: var(--colour-text);
	}
</style>
