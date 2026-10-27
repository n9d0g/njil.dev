import type {
	Calendar,
	ContributionCache,
	ContributionGraph,
	ContributionSource,
} from '../index'

export function createStubSource(
	calendar: Calendar,
	{ fails = false }: { fails?: boolean } = {}
) {
	const source: ContributionSource & { calls: number } = {
		calls: 0,
		async getCalendar() {
			source.calls++
			if (fails) throw new Error('GitHub is down')
			return calendar
		},
	}
	return source
}

export function createMemoryCache(initial?: ContributionGraph) {
	const cache: ContributionCache & { stored?: ContributionGraph } = {
		stored: initial,
		async get() {
			return cache.stored
		},
		async put(graph) {
			cache.stored = graph
		},
	}
	return cache
}
