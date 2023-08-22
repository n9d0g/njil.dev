<script>
  export let data 
  export let dataLink
  export let artist
  export let artistLink
</script>

<div class="flex flex-col">
  <a href={dataLink} target="_blank" class="hover:underline text-normal">{data}</a>
  <a href={artistLink} target="_blank" class="hover:underline text-xs italic">{artist}</a>
</div>
