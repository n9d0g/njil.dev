import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import sanity from '@sanity/astro'

const DEFAULT_SANITY_PROJECT_ID = 'nbid6gbs'
const sanityProjectId =
	process.env.SANITY_PROJECT_ID || DEFAULT_SANITY_PROJECT_ID

export default defineConfig({
	integrations: [
		react(),
		icon(),
		// Public, token-free reads (the Blog) go through Sanity's CDN
		sanity({
			projectId: sanityProjectId,
			dataset: 'production',
			useCdn: true,
		}),
	],
	output: 'server',
	adapter: cloudflare(),
	session: false,
	security: {
		// One-click unsubscribe POSTs come from mail providers, cross-site.
		// Every state-changing endpoint authenticates itself (ADR-0002).
		checkOrigin: false,
	},
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
			}),
			NEWSLETTER_SECRET: envField.string({
				context: 'server',
				access: 'secret',
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
				default: DEFAULT_SANITY_PROJECT_ID,
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
