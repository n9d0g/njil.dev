import { z, defineCollection } from 'astro:content'

const blogCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		author: z.string(),
		published: z.date(),
		description: z.string(),
		tags: z.array(z.string()),
		draft: z.boolean(),
	}),
})

const jobCollection = defineCollection({
	type: 'content',
	schema: z.object({
		company: z.string(),
		position: z.string(),
		location: z.string(),
		startDate: z.date(),
		endDate: z.date(),
		description: z.string(),
		tech: z.array(z.string()),
		points: z.array(z.string()),
	}),
})

const projectCollection = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		url: z.string(),
		location: z.string(),
		startDate: z.date(),
		endDate: z.date(),
		description: z.string(),
		tech: z.array(z.string()),
		repo: z.string(),
		points: z.array(z.string()),
	}),
})

export const collections = {
	blog: blogCollection,
	job: jobCollection,
	project: projectCollection,
}
