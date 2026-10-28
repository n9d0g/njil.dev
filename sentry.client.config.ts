import * as Sentry from '@sentry/astro'

const ENVIRONMENTS: Record<string, string> = {
	'njil.dev': 'production',
	'www.njil.dev': 'production',
	'dev.njil.dev': 'dev',
}
const environment = ENVIRONMENTS[location.hostname]

Sentry.init({
	// Public by design: it ships in the browser bundle. Keep in sync with wrangler.jsonc
	dsn: 'https://c7152c0ccd91aa68c38ef1a91ec2635c@o1146391.ingest.us.sentry.io/4512334158495744',
	// local.njil.dev, localhost and previews stay quiet
	enabled: environment !== undefined,
	environment,
	integrations: [Sentry.browserTracingIntegration()],
	tracesSampleRate: 0.1,
})
