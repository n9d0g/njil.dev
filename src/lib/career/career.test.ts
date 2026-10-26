import { describe, expect, test } from 'vite-plus/test'
import { createCareer } from './index'

// content collections parse YYYY-MM-DD frontmatter to UTC midnight
const date = (iso: string) => new Date(`${iso}T00:00:00Z`)

const job = (company: string, startDate: string, endDate?: string) => ({
	data: {
		company,
		position: 'Frontend Developer',
		location: 'Toronto, ON',
		startDate: date(startDate),
		endDate: endDate ? date(endDate) : undefined,
		description: `work at ${company}`,
		tech: ['logos:react'],
		points: [],
	},
})

const project = (title: string, startDate: string, endDate?: string) => ({
	data: {
		title,
		url: `https://${title}.dev`,
		repo: `https://github.com/n9d0g/${title}`,
		location: 'Mississauga, ON',
		startDate: date(startDate),
		endDate: endDate ? date(endDate) : undefined,
		description: `about ${title}`,
		tech: ['logos:astro'],
		points: [],
	},
})

function careerWith({ jobs = [] as unknown[], projects = [] as unknown[] }) {
	return createCareer({
		getCollection: async (name: string) =>
			(name === 'job' ? jobs : projects) as never,
	})
}

describe('getJobs', () => {
	test('lists Jobs newest first with a display period', async () => {
		const jobs = await careerWith({
			jobs: [
				job('Manulife', '2019-10-01', '2020-05-01'),
				job('QuoteMedia', '2022-09-01'),
				job('Leons', '2021-07-01', '2022-08-01'),
			],
		}).getJobs()

		expect(jobs.map((j) => [j.company, j.period])).toEqual([
			['QuoteMedia', '9/2022 - present'],
			['Leons', '7/2021 - 8/2022'],
			['Manulife', '10/2019 - 5/2020'],
		])
		expect(jobs[0]).toEqual({
			company: 'QuoteMedia',
			position: 'Frontend Developer',
			location: 'Toronto, ON',
			description: 'work at QuoteMedia',
			tech: ['logos:react'],
			period: '9/2022 - present',
		})
	})
})

describe('getProjects', () => {
	test('shows a Project with no end date as ongoing', async () => {
		const [ongoing] = await careerWith({
			projects: [project('njil', '2022-10-01')],
		}).getProjects()

		expect(ongoing.period).toBe('10/2022 - present')
	})

	test('shows the end date of a finished Project', async () => {
		const [finished] = await careerWith({
			projects: [project('fcc', '2022-03-01', '2024-02-14')],
		}).getProjects()

		expect(finished).toEqual({
			title: 'fcc',
			url: 'https://fcc.dev',
			repo: 'https://github.com/n9d0g/fcc',
			description: 'about fcc',
			tech: ['logos:astro'],
			period: '3/2022 - 2/2024',
		})
	})

	test('lists Projects newest first', async () => {
		const projects = await careerWith({
			projects: [project('fcc', '2022-03-01'), project('riseup', '2023-10-01')],
		}).getProjects()

		expect(projects.map((p) => p.title)).toEqual(['riseup', 'fcc'])
	})
})
