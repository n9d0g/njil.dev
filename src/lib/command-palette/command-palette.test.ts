import { describe, expect, test } from 'vite-plus/test'
import type { Job } from '@lib/career'
import { createCommandPalette, matchEntries, pageEntries } from './index'

const job = (overrides: Partial<Job> = {}): Job => ({
	slug: 'quotemedia',
	position: 'Senior Frontend Developer',
	company: 'QuoteMedia',
	location: 'Toronto',
	description: '',
	tech: [],
	links: [],
	period: '1/2024 - present',
	...overrides,
})

const palette = createCommandPalette({
	getJobs: async () => [job()],
	listAllBlogPosts: async () => [
		{ path: '/blog/chemex/', title: 'chemex', tags: ['coffee'] },
	],
})

describe('listEntries', () => {
	test('lists Jobs then Blog posts', async () => {
		expect(await palette.listEntries()).toEqual([
			{
				group: 'work',
				href: '/work/quotemedia',
				label: 'QuoteMedia',
				detail: 'Senior Frontend Developer',
				keywords: 'quotemedia senior frontend developer',
			},
			{
				group: 'blog',
				href: '/blog/chemex/',
				label: 'chemex',
				detail: undefined,
				keywords: 'chemex coffee',
			},
		])
	})
})

describe('matchEntries', () => {
	const entries = async () => [
		...pageEntries(),
		...(await palette.listEntries()),
	]
	const labels = async (query: string) =>
		matchEntries(await entries(), query).map((e) => e.label)

	test('an empty query matches everything, in order', async () => {
		expect(await labels('  ')).toEqual([
			'home',
			'work',
			'projects',
			'blog',
			'contact',
			'QuoteMedia',
			'chemex',
		])
	})

	test('ignores case', async () => {
		expect(await labels('QUOTE')).toEqual(['QuoteMedia'])
	})

	test('every word must match, in any order and any field', async () => {
		expect(await labels('developer quote')).toEqual(['QuoteMedia'])
		expect(await labels('developer coffee')).toEqual([])
	})

	test('matches Blog post tags', async () => {
		expect(await labels('coffee')).toEqual(['chemex'])
	})
})
