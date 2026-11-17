import { defineField, defineType } from 'sanity'

const outcomes = [
	{ title: 'Open', value: 'open' },
	{ title: 'Nathan won', value: 'nathan' },
	{ title: 'Christina won', value: 'christina' },
	{ title: 'Void (nobody won)', value: 'void' },
]

const today = () => new Date().toISOString().slice(0, 10)

// A Bet between Nathan and Christina, shown on the unlisted /bets page
export const betType = defineType({
	name: 'bet',
	title: 'Bet',
	type: 'document',
	fields: [
		defineField({
			name: 'about',
			title: 'What the Bet is about',
			type: 'string',
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'nathanSide',
			title: "Nathan's Side",
			description: 'What Nathan claimed, in his own words',
			type: 'text',
			rows: 2,
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'christinaSide',
			title: "Christina's Side",
			description: 'What Christina claimed, in her own words',
			type: 'text',
			rows: 2,
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'madeOn',
			title: 'Made on',
			type: 'date',
			initialValue: today,
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'settlesOn',
			title: 'Settles on',
			description:
				'Roughly when the Bet will be decided. Leave blank if unknown.',
			type: 'date',
		}),
		defineField({
			name: 'outcome',
			title: 'Outcome',
			type: 'string',
			options: { list: outcomes, layout: 'radio' },
			initialValue: 'open',
			validation: (rule) => rule.required(),
		}),
		defineField({
			name: 'settledOn',
			title: 'Settled on',
			type: 'date',
			hidden: ({ document }) => document?.outcome === 'open',
			validation: (rule) =>
				rule.custom((settledOn, { document }) =>
					document?.outcome !== 'open' && !settledOn
						? 'A Settled Bet needs the date it was settled'
						: true
				),
		}),
	],
	orderings: [
		{
			title: 'Made on, newest first',
			name: 'madeOnDesc',
			by: [{ field: 'madeOn', direction: 'desc' }],
		},
	],
	preview: {
		select: { title: 'about', outcome: 'outcome' },
		prepare: ({ title, outcome }) => ({
			title: title || 'Untitled',
			subtitle: outcomes.find((o) => o.value === outcome)?.title,
		}),
	},
})
