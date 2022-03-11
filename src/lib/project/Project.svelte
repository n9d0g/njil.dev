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
		<a href={link} class="icon" target="_blank">
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
		height: 1.5rem;
		width: 1.5rem;
		transition: .15s ease-in;
	}

	img:hover {
		transform: scale(1.1);
		opacity: 0.5;
	}


	h2 {
		margin: 0;
		padding: 0;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	li {
		display: inline-block;
		padding-right: 5px;
		color: var(--accent-color);
	}

	li::after {
		content: " • "
	}

	li:last-child::after {
		content: "";
	}

	@media (max-width: 60em) {
		p {
			font-size: 1rem;
		}

		li {
			font-size: 0.8rem;
		}
	}
</style>
