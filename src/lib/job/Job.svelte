<script>
  export let title;
  export let company;
  export let location;
  export let dateStart;
  export let dateEnd;
  export let points;
</script>

<article>
  <h2>{title} | <span>{company}</span></h2>
  <h3>{location} | {dateStart} - {dateEnd}</h3>
  <ul>
    {#each points as point}
      <li>{point.point}</li>
    {/each}
  </ul>
</article>

<style>
  h2 {
    margin: 0;
    padding: 0;
  }

  span {
    color: var(--accent-color);
    font-weight: 400;
  }

  h3 {
    color: var(--secondary-color);
    font-weight: 400;
    padding: 0;
    margin: 0;
  }

  ul {
    list-style-type: disc;
    padding: 1rem;
    margin: 0;
  }

  li {
    padding: 0.25rem 0;
  }
</style>
