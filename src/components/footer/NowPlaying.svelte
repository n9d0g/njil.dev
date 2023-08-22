<script>
  import querystring from 'querystring'
	import { onMount } from "svelte"

  export let clientId
  export let clientSecret
  export let refreshToken

  let res
  let data = ''
  let dataLink = ''
  let artist = ''
  let artistLink = ''
  let art = ''

  const basic = btoa(`${clientId}:${clientSecret}`)
  const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`
  const CURRENTLY_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`

  const getAccessToken = async () => {
    const response = await fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })

    return response.json()
  }

  const getCurrentlyPlaying = async () => {
    const { access_token } = await getAccessToken()

    return fetch(`${CURRENTLY_PLAYING_ENDPOINT}?market=ES`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    })
  }

  onMount(async () => {
    const response = await getCurrentlyPlaying()
    if (response.status === 204 || response.status > 400) {
      data = 'Currently not listening to Spotify.'
    } else {
      res = await response.json()
      data = res.item.name
      dataLink = res.item.external_urls.spotify
      artist = res.item.artists[0].name
      artistLink = res.item.artists[0].external_urls.spotify
      art = res.item.album.images[0].url
    }

    console.log(res)
  })
</script>

{#await getCurrentlyPlaying() then} 
<div class="flex items-center gap-3">
  <img src={art} alt="Nathan's Now Playing" class="w-8 h-8 rounded">
  <div class="flex flex-col md:flex-row items-center">
    <a href={dataLink} target="_blank" class="hover:underline text-xs md:text-sm font-semibold">{data}</a>
    <span class="hidden md:block">&nbsp;-&nbsp;</span>
    <a href={artistLink} target="_blank" class="hover:underline text-xs md:text-sm italic">{artist}</a>
  </div> 
</div> 
{/await}

