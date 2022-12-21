<script lang="ts">
	import { page } from '$app/stores';
	export let hrefLink: string;
	export let link: string;
</script>

<li class="relative h-full" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
	<a
		class="flex h-full items-center py-0 px-2 font-bold text-sm uppercase tracking-wide no-underline transition"
		href={hrefLink}
	>
		{link}
	</a>
</li>
