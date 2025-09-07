import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'
import { ContactSchema } from '@validation/form'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: ContactSchema,
		handler: async ({ name, email, message }) => {
			const recaptchaKey = import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY

			console.log(name, email, message, recaptchaKey)
			return `handled`
		},
	}),
}
