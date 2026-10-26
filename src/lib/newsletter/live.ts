import {
	NEWSLETTER_SECRET,
	RECAPTCHA_SECRET_KEY,
	RESEND_API_KEY,
	SANITY_WEBHOOK_SECRET,
} from 'astro:env/server'
import { createRecaptcha } from '@lib/human-check/adapters/recaptcha'
import { createResendMailer } from '@lib/mail/adapters/resend'
import { getSanityClient } from '@lib/sanity'
import { createNewsletter } from './index'
import { createSanityStore } from './adapters/sanity-store'

// Wires the Newsletter to its production adapters. Tests use the memory adapters.
export function getNewsletter() {
	return createNewsletter({
		store: createSanityStore(getSanityClient()),
		mailer: createResendMailer(RESEND_API_KEY),
		humanCheck: createRecaptcha(RECAPTCHA_SECRET_KEY, 'subscribe'),
		webhookSecret: SANITY_WEBHOOK_SECRET,
		unsubscribeSecret: NEWSLETTER_SECRET,
		siteUrl: import.meta.env.SITE.replace(/\/$/, ''),
		from: 'Nathan <hello@njil.dev>',
	})
}
