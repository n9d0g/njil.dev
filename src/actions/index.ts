import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.instanceof(FormData),
		handler: async (data: FormData) => {
			const recaptchaSecretKey = import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY

			return `handled`
		},
	}),
}
