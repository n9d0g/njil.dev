import { blog } from '@lib/blog/live'
import { career } from '@lib/career/live'
import { createCommandPalette } from './index'

export const commandPalette = createCommandPalette({
	getJobs: career.getJobs,
	listAllBlogPosts: blog.listAllBlogPosts,
})
