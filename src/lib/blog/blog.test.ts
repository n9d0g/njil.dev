import { describe, expect, test } from 'vite-plus/test'
import { blogPostPath, createBlog } from './index'

// Stands in for Sanity: every query gets the same canned result
const blogReturning = (result: unknown) =>
	createBlog({ fetch: async <T>() => result as T })

const listed = (overrides: object = {}) => ({
	_id: 'post-1',
	title: 'chemex',
	slug: { _type: 'slug', current: 'chemex' },
	publishedAt: '2026-01-29T15:31:39Z',
	description: 'pour-over notes',
	tags: [{ name: 'coffee', slug: null }],
	coverImage: null,
	images: [{ asset: { url: 'https://cdn.sanity.io/chemex.jpg' } }],
	...overrides,
})

describe('blogPostPath', () => {
	test('is the canonical trailing-slash path', () => {
		expect(blogPostPath('chemex')).toBe('/blog/chemex/')
	})
})

describe('listBlogPosts', () => {
	test('returns display-ready Blog post summaries', async () => {
		const posts = await blogReturning([listed()]).listBlogPosts()

		expect(posts).toEqual([
			{
				slug: 'chemex',
				path: '/blog/chemex/',
				title: 'chemex',
				description: 'pour-over notes',
				displayDate: 'Jan 29, 2026',
				tags: ['coffee'],
				coverImageUrl: 'https://cdn.sanity.io/chemex.jpg',
			},
		])
	})

	test('formats the date in Toronto time, not UTC', async () => {
		// 10pm Jan 28 in Toronto
		const [post] = await blogReturning([
			listed({ publishedAt: '2026-01-29T03:00:00Z' }),
		]).listBlogPosts()

		expect(post.displayDate).toBe('Jan 28, 2026')
	})

	test('tolerates missing optional fields', async () => {
		const [post] = await blogReturning([
			listed({ description: null, tags: null, images: null }),
		]).listBlogPosts()

		expect(post).toMatchObject({ description: undefined, tags: [] })
		expect(post.coverImageUrl).toBeUndefined()
	})
})

describe('getBlogPost', () => {
	test('returns null for an unknown slug', async () => {
		expect(await blogReturning(null).getBlogPost('nope')).toBeNull()
	})

	test('returns a display-ready Blog post', async () => {
		const body = [{ _type: 'block', _key: 'a', children: [] }]
		const post = await blogReturning({
			title: 'chemex',
			author: 'Nathan Lardizabal',
			publishedAt: '2026-01-29T15:31:39Z',
			description: 'pour-over notes',
			tags: [
				{ name: 'coffee', slug: null },
				{ name: null, slug: null },
			],
			images: [
				{ asset: { url: 'https://cdn.sanity.io/a.jpg' }, alt: 'kettle' },
				{ asset: null, alt: 'missing upload' },
				{ asset: { url: 'https://cdn.sanity.io/b.jpg' }, alt: null },
			],
			body,
		}).getBlogPost('chemex')

		expect(post).toEqual({
			slug: 'chemex',
			path: '/blog/chemex/',
			title: 'chemex',
			author: 'Nathan Lardizabal',
			description: 'pour-over notes',
			displayDate: 'Jan 29, 2026',
			tags: ['coffee'],
			gallery: [
				{ url: 'https://cdn.sanity.io/a.jpg', alt: 'kettle' },
				{ url: 'https://cdn.sanity.io/b.jpg', alt: undefined },
			],
			body,
		})
	})

	test('treats a missing body as empty', async () => {
		const post = await blogReturning({
			title: 'draft',
			author: null,
			publishedAt: null,
			description: null,
			tags: null,
			images: null,
			body: null,
		}).getBlogPost('draft')

		expect(post).toMatchObject({
			body: [],
			gallery: [],
			displayDate: '',
			author: undefined,
		})
	})
})
