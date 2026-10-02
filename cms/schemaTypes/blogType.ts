import { defineField, defineType } from 'sanity'

export const blogType = defineType({
	name: 'blog',
	title: 'Blog',
	type: 'document',
	fields: [
		defineField({
			name: 'title',
			title: 'Title',
			description: 'The main title of the blog post',
			type: 'string',
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			description: 'URL-friendly identifier generated from the title',
			type: 'slug',
			options: { source: 'title' },
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'author',
			title: 'Author',
			description: 'The author of this blog post',
			type: 'string',
			initialValue: 'Nathan Lardizabal',
		}),
		defineField({
			name: 'publishedAt',
			title: 'Published At',
			description: 'The date and time when this post was published',
			type: 'datetime',
			initialValue: () => new Date().toISOString(),
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Description',
			description: 'Short summary for SEO and previews',
			type: 'text',
			rows: 3,
		}),
		defineField({
			name: 'tags',
			title: 'Tags',
			description: 'Categorize this post with relevant tags',
			type: 'array',
			of: [{ type: 'reference', to: [{ type: 'tag' }] }],
		}),
		defineField({
			name: 'images',
			title: 'Gallery Images',
			description: 'Images to display in a bento grid at the bottom of the post',
			type: 'array',
			of: [
				{
					type: 'image',
					options: {
						hotspot: true,
					},
					fields: [
						{
							name: 'alt',
							type: 'string',
							title: 'Alt Text',
							description: 'Describe the image for accessibility',
						},
					],
				},
			],
		}),
		defineField({
			name: 'body',
			title: 'Body',
			description: 'The main content of the blog post',
			type: 'array',
			of: [
				{ type: 'block' },
				{
					type: 'image',
					options: { hotspot: true },
					fields: [
						{
							name: 'alt',
							type: 'string',
							title: 'Alt Text',
							description: 'Describe the image for accessibility',
						},
						{
							name: 'caption',
							type: 'string',
							title: 'Caption',
							description: 'Optional caption to display below the image',
						},
					],
				},
				{
					type: 'code',
					options: {
						language: 'javascript',
						languageAlternatives: [
							{ title: 'JavaScript', value: 'javascript' },
							{ title: 'TypeScript', value: 'typescript' },
							{ title: 'HTML', value: 'html' },
							{ title: 'CSS', value: 'css' },
							{ title: 'JSON', value: 'json' },
							{ title: 'Markdown', value: 'markdown' },
							{ title: 'Bash', value: 'bash' },
							{ title: 'Plain Text', value: 'text' },
						],
						withFilename: true,
					},
				},
			],
		}),
	],
	preview: {
		select: {
			title: 'title',
			publishedAt: 'publishedAt',
		},
		prepare({ title, publishedAt }) {
			const date = publishedAt
				? new Date(publishedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})
				: 'No date'
			return {
				title: title || 'Untitled',
				subtitle: date,
			}
		},
	},
})
