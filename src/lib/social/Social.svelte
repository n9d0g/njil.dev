<script>
  export let link;
  export let svg;
  export let alt;
</script>

<li>
  <a href={link} target="_blank">
    <img src={svg} alt={alt}>
  </a>
</li>

<style>
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
