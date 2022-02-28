<script>
	import linkedin from './linkedin.svg';
	import github from './github.svg';
	import resume from './resume.svg';
	import soundcloud from './soundcloud.svg';
	import spotify from './spotify.svg';
	import chess from './chess.svg';
	import Social from '$lib/social/Social.svelte';

	const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
	const date = new Date()
	let day = weekday[date.getDay()]
</script>

<footer>
	<hr>
	<ul>
		<Social link="https://github.com/n9d0g" svg={github} alt="Nathan's Github" />
		<Social link="https://www.linkedin.com/in/njlardizabal/" svg={linkedin} alt="Nathan's LinkedIn" />
		<Social link="https://soundcloud.com/n9d0g" svg={resume} alt="Nathan's Resume" />
		<Social link="https://soundcloud.com/n9d0g" svg={soundcloud} alt="Nathan's Soundcloud" />
		<Social link="https://open.spotify.com/user/nathanjlardizabal?si=9547f92287a042d3" svg={spotify} alt="Nathan's Spotify" />
		<Social link="https://www.chess.com/member/n9d0g" svg={chess} alt="Play Chess with Nathan" />
	</ul>
	<p>nathan james lardizabal | have a good {day} :)</p>
</footer>

<style>
	footer {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		padding: 1rem;
		width: 100%;
		max-width: 80em;
		margin: 0 auto;
	}

	hr {
		display: none;
	}

	ul {
		display: flex;
		justify-content: center;
		align-items: center;
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	p {
		display: flex;
		justify-content: flex-end;
		max-width: 80rem;
		width: 100%;
		margin: 0 auto;
		padding: 0;
	}

	@media (max-width: 60em) {
		hr {
			display: block;
			width: 90%;
			color: var(--accent-color);
		}

		footer {
			flex-direction: column;
			gap: 0.7rem;
			justify-content: center;
			padding: 0 0 1rem 0;
		}

		p {
			text-align: center;
			font-size: 0.8rem;
			justify-content: center;
		}
	}
</style>
