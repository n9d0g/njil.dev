import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const tech = z.array(z.object({ icon: z.string(), name: z.string() }))

const jobCollection = defineCollection({
	loader: glob({ base: './src/content/job', pattern: '**/*.md' }),
	schema: z.object({
		company: z.string(),
		position: z.string(),
		location: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		description: z.string(),
		tech,
		links: z
			.array(z.object({ label: z.string(), url: z.string().url() }))
			.default([]),
		// Path under public/, e.g. /logos/quotemedia.svg
		logo: z.string().optional(),
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
		tech,
		repo: z.string(),
		points: z.array(z.string()),
	}),
})

export const collections = {
	job: jobCollection,
	project: projectCollection,
}
