import { defineQuery } from 'groq'
import type {
	BlogBySlugQueryResult,
	BlogListQueryResult,
} from '@app-types/sanity.types'

export interface BlogPostSummary {
	slug: string
	path: string
	title: string
	description?: string
	displayDate: string
	tags: string[]
	coverImageUrl?: string
}

export interface BlogPost extends Omit<BlogPostSummary, 'coverImageUrl'> {
	author?: string
	gallery: { url: string; alt?: string }[]
	body: NonNullable<NonNullable<BlogBySlugQueryResult>['body']>
}

export interface BlogClient {
	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>
}

const blogListQuery = defineQuery(`*[
	_type == "blog"
	&& defined(slug.current)
]|order(publishedAt desc)[0...12]{
	_id,
	title,
	slug,
	publishedAt,
	description,
	tags[]->{ name, slug },
	images[]{ asset->{ url } }[0...1]
}`)

const blogBySlugQuery =
	defineQuery(`*[_type == "blog" && slug.current == $slug][0]{
	title,
	author,
	publishedAt,
	description,
	tags[]->{ name, slug },
	images[]{ asset->{ url }, alt },
	body[]{
		...,
		_type == "image" => { asset->{ url }, alt, caption },
		_type == "code" => { language, code, filename }
	}
}`)

export const blogPostPath = (slug: string) => `/blog/${slug}/`

// Workers run in UTC; Blog posts are dated in the author's time zone
const dateFormat = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'America/Toronto',
})

const displayDate = (publishedAt: string | null) =>
	publishedAt ? dateFormat.format(new Date(publishedAt)) : ''

const tagNames = (tags: { name: string | null }[] | null) =>
	(tags ?? []).flatMap(({ name }) => (name ? [name] : []))

export function createBlog(client: BlogClient) {
	async function listBlogPosts(): Promise<BlogPostSummary[]> {
		const posts = await client.fetch<BlogListQueryResult>(blogListQuery)

		return posts.flatMap((post) => {
			const slug = post.slug?.current
			if (!slug) return []
			return [
				{
					slug,
					path: blogPostPath(slug),
					title: post.title ?? 'Untitled',
					description: post.description ?? undefined,
					displayDate: displayDate(post.publishedAt),
					tags: tagNames(post.tags),
					// the schema has no cover field: a post's cover is its first image
					coverImageUrl: post.images?.[0]?.asset?.url ?? undefined,
				},
			]
		})
	}

	async function getBlogPost(slug: string): Promise<BlogPost | null> {
		const post = await client.fetch<BlogBySlugQueryResult>(blogBySlugQuery, {
			slug,
		})
		if (!post) return null

		return {
			slug,
			path: blogPostPath(slug),
			title: post.title ?? 'Untitled',
			author: post.author ?? undefined,
			description: post.description ?? undefined,
			displayDate: displayDate(post.publishedAt),
			tags: tagNames(post.tags),
			gallery: (post.images ?? []).flatMap(({ asset, alt }) =>
				asset?.url ? [{ url: asset.url, alt: alt ?? undefined }] : []
			),
			body: post.body ?? [],
		}
	}

	return { listBlogPosts, getBlogPost }
}
