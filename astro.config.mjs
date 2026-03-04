import { defineConfig } from 'astro/config'
import partytown from '@astrojs/partytown'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'

import sanity from '@sanity/astro'

export default defineConfig({
	integrations: [
		partytown(),
		icon(),
		sanity({
			projectId: 'nbid6gbs',
			dataset: 'production',
			useCdn: false,
		}),
	],
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
