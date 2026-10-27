import type { CollectionEntry, render } from 'astro:content'

export interface Tech {
	icon: string
	name: string
}

export interface Job {
	slug: string
	position: string
	company: string
	location: string
	description: string
	tech: Tech[]
	links: { label: string; url: string }[]
	logo?: string
	period: string
}

// A Job with its write-up, for its own page
export interface JobPage extends Job {
	Content: Awaited<ReturnType<typeof render>>['Content']
}

export interface Project {
	title: string
	url: string
	repo: string
	description: string
	tech: Tech[]
	period: string
}

export interface CareerContent {
	getCollection(name: 'job'): Promise<CollectionEntry<'job'>[]>
	getCollection(
		name: 'project'
	): Promise<Pick<CollectionEntry<'project'>, 'data'>[]>
	render(entry: CollectionEntry<'job'>): ReturnType<typeof render>
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
	const toJob = ({ id, data }: CollectionEntry<'job'>): Job => ({
		slug: id,
		position: data.position,
		company: data.company,
		location: data.location,
		description: data.description,
		tech: data.tech,
		links: data.links,
		logo: data.logo,
		period: period(data),
	})

	async function getJobs(): Promise<Job[]> {
		const entries = await content.getCollection('job')
		return newestFirst(entries).map(toJob)
	}

	async function getJob(slug: string): Promise<JobPage | null> {
		const entries = await content.getCollection('job')
		const entry = entries.find((e) => e.id === slug)
		if (!entry) return null

		const { Content } = await content.render(entry)
		return { ...toJob(entry), Content }
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

	return { getJobs, getJob, getProjects }
}
