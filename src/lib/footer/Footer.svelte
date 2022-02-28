<script>
	import linkedin from './linkedin.svg';
	import github from './github.svg';
	import resume from './resume.svg';
	import soundcloud from './soundcloud.svg';
	import spotify from './spotify.svg';
import Social from '$lib/social/Social.svelte';

	const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
	const date = new Date()
	let day = weekday[date.getDay()]
</script>

<footer>
	<ul>
		<Social link="https://github.com/n9d0g" svg={github} alt="Nathan's Github" />
		<Social link="https://www.linkedin.com/in/njlardizabal/" svg={linkedin} alt="Nathan's LinkedIn" />
		<Social link="https://soundcloud.com/n9d0g" svg={resume} alt="Nathan's Resume" />
		<Social link="https://soundcloud.com/n9d0g" svg={soundcloud} alt="Nathan's Soundcloud" />
		<Social link="https://open.spotify.com/user/nathanjlardizabal?si=9547f92287a042d3" svg={spotify} alt="Nathan's Spotify" />
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
</style>
