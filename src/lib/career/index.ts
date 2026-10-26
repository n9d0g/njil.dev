import type { CollectionEntry } from 'astro:content'

export interface Job {
	position: string
	company: string
	location: string
	description: string
	tech: string[]
	period: string
}

export interface Project {
	title: string
	url: string
	repo: string
	description: string
	tech: string[]
	period: string
}

export interface CareerContent {
	getCollection(name: 'job'): Promise<Pick<CollectionEntry<'job'>, 'data'>[]>
	getCollection(
		name: 'project'
	): Promise<Pick<CollectionEntry<'project'>, 'data'>[]>
}

// Frontmatter dates are calendar months stored as UTC midnight, so they're
// read in UTC: in Toronto time 2022-09-01 would display as 8/2022
const monthYear = (date: Date) =>
	`${date.getUTCMonth() + 1}/${date.getUTCFullYear()}`

// A Job or Project with no end date is ongoing
const period = ({ startDate, endDate }: { startDate: Date; endDate?: Date }) =>
	`${monthYear(startDate)} - ${endDate ? monthYear(endDate) : 'present'}`

const newestFirst = <T extends { data: { startDate: Date } }>(entries: T[]) =>
	entries.toSorted(
		(a, b) => b.data.startDate.getTime() - a.data.startDate.getTime()
	)

export function createCareer(content: CareerContent) {
	async function getJobs(): Promise<Job[]> {
		const entries = await content.getCollection('job')
		return newestFirst(entries).map(({ data }) => ({
			position: data.position,
			company: data.company,
			location: data.location,
			description: data.description,
			tech: data.tech,
			period: period(data),
		}))
	}

	async function getProjects(): Promise<Project[]> {
		const entries = await content.getCollection('project')
		return newestFirst(entries).map(({ data }) => ({
			title: data.title,
			url: data.url,
			repo: data.repo,
			description: data.description,
			tech: data.tech,
			period: period(data),
		}))
	}

	return { getJobs, getProjects }
}
