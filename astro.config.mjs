import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icon from 'astro-icon'
import sanity from '@sanity/astro'

const DEFAULT_SANITY_PROJECT_ID = 'nbid6gbs'
const sanityProjectId =
	process.env.SANITY_PROJECT_ID || DEFAULT_SANITY_PROJECT_ID

// Local mkcert cert covering local.njil.dev. Dev serves HTTPS only when it's
// present, so CI and fresh clones fall back to plain http://localhost.
const LOCAL_CERT_DIR =
	process.env.LOCAL_CERT_DIR || join(homedir(), 'Documents/dev/.certs')
const localCert = join(LOCAL_CERT_DIR, 'cert.pem')
const localKey = join(LOCAL_CERT_DIR, 'cert-key.pem')
const https =
	existsSync(localCert) && existsSync(localKey)
		? { cert: readFileSync(localCert), key: readFileSync(localKey) }
		: undefined

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
		// 443 so https://local.njil.dev needs no port; plain http stays on 3001
		port: https ? 443 : 3001,
		host: true,
		allowedHosts: ['local.njil.dev'],
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
			// Optional: without it the homepage renders without the Contribution graph
			GITHUB_TOKEN: envField.string({
				context: 'server',
				access: 'secret',
				optional: true,
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
		server: { https },
		ssr: {
			optimizeDeps: {
				// astro-icon's Icon.astro imports @iconify/utils, whose barrel pulls in
				// the CommonJS `debug` package. Vite doesn't scan .astro files inside
				// node_modules, so without this it reaches the workerd dev runner
				// unbundled and every page 500s with "module is not defined".
				include: ['astro-icon > @iconify/utils'],
			},
		},
	},
})
