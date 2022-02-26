<script>
	const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
	const date = new Date()
	let day = weekday[date.getDay()]
</script>

<footer>
	<p>nathan james lardizabal | have a good {day} :)</p>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 40px;
	}

	@media (min-width: 480px) {
		footer {
			padding: 40px 0;
		}
	}
</style>
