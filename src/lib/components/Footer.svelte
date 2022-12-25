<script>
	import SocialIcon from './SocialIcon.svelte';
	import GitHub from '$lib/icons/GitHub.svelte';
	import LinkedIn from '$lib/icons/LinkedIn.svelte';
	import Resume from '$lib/icons/Resume.svelte';
	import Soundcloud from '$lib/icons/Soundcloud.svelte';
	import Email from '$lib/icons/Email.svelte';
	import Spotify from '$lib/icons/Spotify.svelte';
</script>

<footer class="flex flex-col justify-center items-center p-4">
	<div class="flex items-center justify-center gap-4 py-2 ">
		<SocialIcon link="https://github.com/n9d0g" aria="GitHub profile">
			<GitHub />
		</SocialIcon>
		<SocialIcon link="https://www.linkedin.com/in/njlardizabal/" aria="LinkedIn profile">
			<LinkedIn />
		</SocialIcon>
		<SocialIcon link="mailto:nathanjlardizabal@gmail.com" aria="Email Nathan Lardizabal">
			<Email />
		</SocialIcon>
		<SocialIcon
			link="https://rxresu.me/nathanjlardizabal/nathan-lardizabal-resume-2022"
			aria="Nathan's Resume"
		>
			<Resume />
		</SocialIcon>
		<SocialIcon
			link="https://open.spotify.com/user/nathanjlardizabal?si=6b1303a6e4dd4bbf"
			aria="Spotify profile"
		>
			<Spotify />
		</SocialIcon>
		<SocialIcon link="https://soundcloud.com/n9d0g" aria="Soundcloud profile">
			<Soundcloud />
		</SocialIcon>
	</div>
	<p class="text-xs">&copy; Nathan Lardizabal. All Rights Reserved.</p>
</footer>
