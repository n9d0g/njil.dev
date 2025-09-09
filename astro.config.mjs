import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'
import vercel from '@astrojs/vercel'

export default defineConfig({
	integrations: [tailwind(), partytown()],
	output: 'server',
	adapter: vercel({ webAnalytics: true }),
})
