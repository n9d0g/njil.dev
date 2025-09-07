import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

export const contact = {
	submit: defineAction({
		handler: async (input) => {
			return `Hello ${input.name}`
		},
	}),
}
