import { defineConfig } from 'astro/config'
import partytown from '@astrojs/partytown'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
	integrations: [partytown()],
	output: 'server',
	adapter: vercel({ webAnalytics: true }),
	site: 'https://www.njil.dev',
	server: {
		port: 3001,
		host: true,
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
