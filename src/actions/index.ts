import { defineAction } from 'astro:actions'
import { z } from 'astro:schema'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.object({
			name: z.string(),
			email: z.string().email(),
			message: z.string(),
		}),
		handler: async ({ name, email, message }) => {
			console.log(name, email, message)
			return `handled`
		},
	}),
}
