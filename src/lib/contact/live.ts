import { RECAPTCHA_SECRET_KEY, RESEND_API_KEY } from 'astro:env/server'
import { createRecaptcha } from '@lib/human-check/adapters/recaptcha'
import { createResendMailer } from '@lib/mail/adapters/resend'
import { createContact } from './index'

// Wires Contact to its production adapters. Tests use the memory adapters.
export function getContact() {
	return createContact({
		mailer: createResendMailer(RESEND_API_KEY),
		humanCheck: createRecaptcha(RECAPTCHA_SECRET_KEY, 'contact'),
		from: 'njil.dev <hello@njil.dev>',
		to: 'nate@njil.dev',
	})
}
