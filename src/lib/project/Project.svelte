<script>
	import githubIcon from '../footer/github.svg'
	import globe from './globe.svg'

  export let title;
  export let description;
  export let github;
  export let link;
  export let stack;
</script>

<article>
	<div class="icon-container">
		<a href={github} class="icon" target="_blank">
			<img src={githubIcon} alt="{title} Github">
		</a>
		<a href={link} class="icon">
			<img src={globe} alt="{title} Site">
		</a>
	</div>
	<h2>{title}</h2>	
	<p>{description}</p>
	<ul class="stack">
		{#each stack as tech}
			<li>{tech.tech}</li>
		{/each}
	</ul>
</article>

<style>
	article {
		background: var(--secondary-color);
		padding: 2rem;
		box-shadow: rgba(100, 100, 111, 0.2) 0px 13px 29px 0px;
	}

	.icon-container {
		display: flex;
		justify-content: flex-end;
	}

	img {
		padding: 0 0.75rem;
		height: 2rem;
		width: 2rem;
		transition: .15s ease-in;
	}

	img:hover {
		transform: scale(1.1);
	}


	h2 {
		margin: 0;
		padding: 0;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	ul > li {
		display: inline-block;
		padding-right: 5px;
	}

	li::after {
		content: " | "
	}
</style>
