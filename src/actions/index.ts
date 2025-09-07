import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.object({
			name: z.string(),
			email: z.string().email(),
			message: z.string(),
			recaptchaToken: z.string(),
		}),
		handler: async ({ name, email, message }) => {
			const recaptchaKey = import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY

			console.log(name, email, message, recaptchaKey)
			return `handled`
		},
	}),
}
