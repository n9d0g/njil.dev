<script>
	import Header from '../lib/components/Header.svelte';
	import Footer from '../lib/components/Footer.svelte';
	import './styles.css';
</script>

<div
	class="flex bg-[var(--bg-light)] dark:bg-[var(--bg-dark)] min-h-screen flex-col justify-between dark:text-[var(--colour-text-dark)]"
>
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>
