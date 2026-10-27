import type { ContributionCache, ContributionGraph } from '../index'

// Cloudflare's per-data-centre cache, keyed by a URL that is never fetched
const KEY = 'https://njil.dev/__cache/contribution-graph'

export function createEdgeCache(ttlSeconds: number): ContributionCache {
	// Absent outside a Worker (e.g. some local dev setups): run uncached
	const edge = (globalThis as { caches?: { default?: Cache } }).caches?.default

	return {
		async get() {
			const hit = await edge?.match(KEY)
			return hit ? ((await hit.json()) as ContributionGraph) : undefined
		},
		async put(graph) {
			await edge?.put(
				KEY,
				new Response(JSON.stringify(graph), {
					headers: {
						'Content-Type': 'application/json',
						'Cache-Control': `max-age=${ttlSeconds}`,
					},
				})
			)
		},
	}
}
