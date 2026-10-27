import { describe, expect, test } from 'vite-plus/test'
import { createContributions, type CalendarDay } from './index'
import { createMemoryCache, createStubSource } from './adapters/memory'

const day = (
	date: string,
	contributionCount: number,
	contributionLevel: CalendarDay['contributionLevel'] = 'NONE'
): CalendarDay => ({ date, contributionCount, contributionLevel })

const calendar = {
	totalContributions: 7,
	weeks: [
		{
			contributionDays: [
				day('2025-10-26', 0),
				day('2025-10-27', 1, 'FIRST_QUARTILE'),
			],
		},
		{
			contributionDays: [
				day('2025-11-02', 2, 'SECOND_QUARTILE'),
				day('2025-11-03', 4, 'FOURTH_QUARTILE'),
			],
		},
	],
}

function setup({ fails = false, cached = undefined as unknown } = {}) {
	const source = createStubSource(calendar, { fails })
	const cache = createMemoryCache(cached as never)
	const contributions = createContributions({
		source,
		cache,
		login: 'n9d0g',
	})
	return { contributions, source, cache }
}

describe('getContributionGraph', () => {
	test('turns the calendar into weeks of days with a 0-4 level', async () => {
		const { contributions } = setup()

		const graph = await contributions.getContributionGraph()

		expect(graph).toEqual({
			total: 7,
			profileUrl: 'https://github.com/n9d0g',
			weeks: [
				[
					{ date: '2025-10-26', count: 0, level: 0 },
					{ date: '2025-10-27', count: 1, level: 1 },
				],
				[
					{ date: '2025-11-02', count: 2, level: 2 },
					{ date: '2025-11-03', count: 4, level: 4 },
				],
			],
		})
	})

	test('caches the graph, so GitHub is asked once', async () => {
		const { contributions, source } = setup()

		await contributions.getContributionGraph()
		await contributions.getContributionGraph()

		expect(source.calls).toBe(1)
	})

	test('serves a cached graph without asking GitHub', async () => {
		const cached = { total: 1, profileUrl: 'cached', weeks: [] }
		const { contributions, source } = setup({ cached })

		const graph = await contributions.getContributionGraph()

		expect(graph).toEqual(cached)
		expect(source.calls).toBe(0)
	})

	test('returns null when GitHub fails, so the homepage still renders', async () => {
		const { contributions, cache } = setup({ fails: true })

		const graph = await contributions.getContributionGraph()

		expect(graph).toBeNull()
		expect(cache.stored).toBeUndefined()
	})
})
