// In your Sanity Studio schemas folder
import { defineField, defineType } from 'sanity'

export const subscriberType = defineType({
	name: 'subscriber',
	title: 'Subscriber',
	type: 'document',
	fields: [
		defineField({
			name: 'email',
			title: 'Email',
			type: 'string',
			validation: (rule) => rule.required().email(),
		}),
		defineField({
			name: 'subscribedAt',
			title: 'Subscribed At',
			type: 'datetime',
		}),
		defineField({
			name: 'active',
			title: 'Active',
			type: 'boolean',
			initialValue: true,
		}),
	],
})
