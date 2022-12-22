<script>
	import Header from '../lib/components/Header.svelte';
	import Footer from '../lib/components/Footer.svelte';
	import './styles.css';
</script>

<div class="flex container min-h-screen flex-col justify-between">
	<Header />
	<main>
		<slot />
	</main>
	<Footer />
</div>
