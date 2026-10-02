import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
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
	adapter: cloudflare(),
	session: false,
	site: 'https://www.njil.dev',
	server: {
		port: 3001,
		host: true,
	},
	env: {
		schema: {
			SANITY_API_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),
			SANITY_WEBHOOK_SECRET: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
			}),
			RESEND_API_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),
			RECAPTCHA_SECRET_KEY: envField.string({
				context: 'server',
				access: 'secret',
			}),
			SANITY_PROJECT_ID: envField.string({
				context: 'server',
				access: 'public',
				default: 'nbid6gbs',
				optional: true,
			}),
			PUBLIC_RECAPTCHA_SITE_KEY: envField.string({
				context: 'client',
				access: 'public',
			}),
		},
	},
	vite: {
		plugins: [tailwindcss()],
	},
})
