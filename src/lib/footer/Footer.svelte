<script>
	import linkedin from './linkedin.svg';
	import github from './github.svg';
	import resume from './resume.svg';
	import soundcloud from './soundcloud.svg';

	const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
	const date = new Date()
	let day = weekday[date.getDay()]
</script>

<footer>
	<ul>
		<li>
			<a href="https://github.com/n9d0g" target="_blank">
				<img src={github} alt="Nathan's Github">
			</a>
		</li>
		<li>
			<a href="https://www.linkedin.com/in/njlardizabal/" target="_blank">
				<img src={linkedin} alt="Nathan's LinkedIn">
			</a>
		</li>
		<li>
			<a href="https://soundcloud.com/n9d0g" target="_blank">
				<img src={resume} alt="Nathan's Resume">
			</a>
		</li>
		<li>
			<a href="https://soundcloud.com/n9d0g" target="_blank">
				<img src={soundcloud} alt="Nathan's Soundcloud">
			</a>
		</li>
	</ul>
	<p>nathan james lardizabal | have a good {day} :)</p>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 0.5rem;
		width: 100%;
		max-width: 80em;
		margin: 0 auto;
	}

	ul {
		display: flex;
		justify-content: center;
		align-items: center;
		list-style-type: none;
		margin: 0;
		padding: 0;
	}
	
	li {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	img {
		padding: 0 1rem;
		height: 2rem;
		width: 2rem;
	}
</style>
