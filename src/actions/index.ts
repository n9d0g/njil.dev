import { defineAction } from 'astro:actions'

export const server = {
	contact: defineAction({
		handler: async (input) => {
			return `handled`
		},
	}),
}
