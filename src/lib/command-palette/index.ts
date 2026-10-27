import type { BlogPostLink } from '@lib/blog'
import type { Job } from '@lib/career'

export interface Page {
	href: string
	label: string
}

// The site's top-level pages, in nav order
export const pages: Page[] = [
	{ href: '/', label: 'home' },
	{ href: '/work', label: 'work' },
	{ href: '/projects', label: 'projects' },
	{ href: '/blog', label: 'blog' },
	{ href: '/contact', label: 'contact' },
]

export type PaletteGroup = 'pages' | 'work' | 'blog'

// Somewhere the Command palette can jump to
export interface PaletteEntry {
	group: PaletteGroup
	href: string
	label: string
	detail?: string
	// lowercased text a query is matched against
	keywords: string
}

const entry = (
	group: PaletteGroup,
	href: string,
	label: string,
	detail?: string,
	extra: string[] = []
): PaletteEntry => ({
	group,
	href,
	label,
	detail,
	keywords: [label, detail, ...extra].filter(Boolean).join(' ').toLowerCase(),
})

export const pageEntries = (list: Page[] = pages) =>
	list.map(({ href, label }) => entry('pages', href, label))

export interface PaletteSources {
	getJobs(): Promise<Job[]>
	listAllBlogPosts(): Promise<BlogPostLink[]>
}

export function createCommandPalette(sources: PaletteSources) {
	// Jobs then Blog posts: the pages ship with the palette itself
	async function listEntries(): Promise<PaletteEntry[]> {
		const [jobs, posts] = await Promise.all([
			sources.getJobs(),
			sources.listAllBlogPosts(),
		])
		return [
			...jobs.map((job) =>
				entry('work', `/work/${job.slug}`, job.company, job.position)
			),
			...posts.map((post) =>
				entry('blog', post.path, post.title, undefined, post.tags)
			),
		]
	}

	return { listEntries }
}

// Every word of the query must appear somewhere in the entry; order is kept
export function matchEntries(entries: PaletteEntry[], query: string) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean)
	return entries.filter(({ keywords }) =>
		words.every((word) => keywords.includes(word))
	)
}
