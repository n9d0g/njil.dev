import { createClient } from '@sanity/client'

export const SANITY_PROJECT_ID = import.meta.env.SANITY_PROJECT_ID || 'nbid6gbs'

export const sanityClient = createClient({
	projectId: SANITY_PROJECT_ID,
	dataset: 'production',
	apiVersion: '2024-01-01',
	token: import.meta.env.SANITY_API_KEY,
	useCdn: false,
})
