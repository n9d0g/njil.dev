import { defineConfig } from 'astro/config'
import vercel from '@astrojs/vercel'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import sanity from '@sanity/astro'

const sanityProjectId = process.env.SANITY_PROJECT_ID || 'nbid6gbs'

export default defineConfig({
	integrations: [
		react(),
		icon(),
		sanity({
			projectId: sanityProjectId,
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
