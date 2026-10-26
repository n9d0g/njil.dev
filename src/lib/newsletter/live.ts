import {
	RECAPTCHA_SECRET_KEY,
	RESEND_API_KEY,
	SANITY_WEBHOOK_SECRET,
} from 'astro:env/server'
import { getSanityClient } from '@lib/sanity'
import { createNewsletter } from './index'
import { createRecaptcha } from './adapters/recaptcha'
import { createResendMailer } from './adapters/resend-mailer'
import { createSanityStore } from './adapters/sanity-store'

// Wires the Newsletter to its production adapters. Tests use ./adapters/memory.
export function getNewsletter() {
	return createNewsletter({
		store: createSanityStore(getSanityClient()),
		mailer: createResendMailer(RESEND_API_KEY),
		humanCheck: createRecaptcha(RECAPTCHA_SECRET_KEY, 'subscribe'),
		webhookSecret: SANITY_WEBHOOK_SECRET,
		siteUrl: import.meta.env.SITE.replace(/\/$/, ''),
		from: 'Nathan <hello@njil.dev>',
	})
}
