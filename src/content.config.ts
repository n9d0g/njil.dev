import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const jobCollection = defineCollection({
	loader: glob({ base: './src/content/job', pattern: '**/*.md' }),
	schema: z.object({
		company: z.string(),
		position: z.string(),
		location: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		current: z.boolean().optional(),
		description: z.string(),
		tech: z.array(z.string()),
		points: z.array(z.string()),
	}),
})

const projectCollection = defineCollection({
	loader: glob({ base: './src/content/project', pattern: '**/*.md' }),
	schema: z.object({
		title: z.string(),
		url: z.string(),
		location: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		description: z.string(),
		tech: z.array(z.string()),
		repo: z.string(),
		points: z.array(z.string()),
	}),
})

export const collections = {
	job: jobCollection,
	project: projectCollection,
}
