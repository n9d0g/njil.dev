import type { PortableTextBlock } from '@portabletext/types'

export interface SanityTag {
	name: string
	slug: { current: string }
}

export interface SanityImage {
	asset: { url: string }
	alt?: string
}

export interface SanityBlogListItem {
	_id: string
	title: string
	slug: { current: string }
	publishedAt: string
	description?: string
	tags?: SanityTag[]
	coverImage?: { asset: { url: string } }
	images?: { asset: { url: string } }[]
}

export interface SanityBlog {
	title: string
	author: string
	publishedAt: string
	description?: string
	tags?: SanityTag[]
	images?: SanityImage[]
	body?: PortableTextBlock[]
}

export interface SanityBlogData {
	title: string
	author: string
	publishedAt: string
	tags?: SanityTag[]
	images?: SanityImage[]
	description?: string
	body?: PortableTextBlock[]
}

export interface Subscriber {
	email: string
	active: boolean
}

export interface SanityWebhookPayload {
	_id: string
	_type: string
	title?: string
	slug?: { current: string }
	description?: string
}
