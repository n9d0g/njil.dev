import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import partytown from '@astrojs/partytown'
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel/serverless'

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), partytown(), svelte()],
	output: 'server',
	adapter: vercel({
		webAnalytics: true,
		speedInsights: true,
	}),
})
