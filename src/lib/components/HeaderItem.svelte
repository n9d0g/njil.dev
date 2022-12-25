<script lang="ts">
	import { page } from '$app/stores';
	export let hrefLink: string;
	export let link: string;
</script>

<li class="flex relative h-full" aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
	<button aria-label={link}>
		<a
			class="flex h-full items-center py-0 px-2 text-sm lowercase tracking-wide no-underline transition text-[var(--colour-text)] dark:text-[var(--colour-text-dark)]"
			href={hrefLink}
		>
			{link}
		</a>
	</button>
</li>
