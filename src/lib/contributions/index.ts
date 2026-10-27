// GitHub's contributionCalendar, as returned by its GraphQL API
export interface CalendarDay {
	date: string
	contributionCount: number
	contributionLevel:
		| 'NONE'
		| 'FIRST_QUARTILE'
		| 'SECOND_QUARTILE'
		| 'THIRD_QUARTILE'
		| 'FOURTH_QUARTILE'
}

export interface Calendar {
	totalContributions: number
	weeks: { contributionDays: CalendarDay[] }[]
}

export interface ContributionDay {
	date: string
	count: number
	level: 0 | 1 | 2 | 3 | 4
}

export interface ContributionGraph {
	total: number
	profileUrl: string
	// Oldest week first; each week runs Sunday to Saturday
	weeks: ContributionDay[][]
}

export interface ContributionSource {
	getCalendar(login: string): Promise<Calendar>
}

export interface ContributionCache {
	get(): Promise<ContributionGraph | undefined>
	put(graph: ContributionGraph): Promise<void>
}

export interface ContributionsConfig {
	source: ContributionSource
	cache: ContributionCache
	login: string
}

const LEVELS: Record<
	CalendarDay['contributionLevel'],
	ContributionDay['level']
> = {
	NONE: 0,
	FIRST_QUARTILE: 1,
	SECOND_QUARTILE: 2,
	THIRD_QUARTILE: 3,
	FOURTH_QUARTILE: 4,
}

export function createContributions({
	source,
	cache,
	login,
}: ContributionsConfig) {
	// Never throws: the homepage renders without the Contribution graph instead
	async function getContributionGraph(): Promise<ContributionGraph | null> {
		const cached = await cache.get()
		if (cached) return cached

		try {
			const calendar = await source.getCalendar(login)
			const graph: ContributionGraph = {
				total: calendar.totalContributions,
				profileUrl: `https://github.com/${login}`,
				weeks: calendar.weeks.map((week) =>
					week.contributionDays.map((day) => ({
						date: day.date,
						count: day.contributionCount,
						level: LEVELS[day.contributionLevel],
					}))
				),
			}
			await cache.put(graph)
			return graph
		} catch (error) {
			console.error('Contribution graph unavailable:', error)
			return null
		}
	}

	return { getContributionGraph }
}

export type Contributions = ReturnType<typeof createContributions>
