import { SANITY_API_KEY, SANITY_PROJECT_ID } from 'astro:env/server'
import { createClient, type SanityClient } from '@sanity/client'

export { SANITY_PROJECT_ID }

let sanityClient: SanityClient | undefined

export function getSanityClient() {
	if (!sanityClient) {
		sanityClient = createClient({
			projectId: SANITY_PROJECT_ID,
			dataset: 'production',
			apiVersion: '2024-01-01',
			token: SANITY_API_KEY,
			useCdn: false,
		})
	}
	return sanityClient
}
