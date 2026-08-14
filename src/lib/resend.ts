import { Resend } from 'resend'

let client: Resend | undefined

function getClient() {
	client ??= new Resend(import.meta.env.RESEND_API_KEY)
	return client
}

export const resend = {
	get emails() {
		return getClient().emails
	},
}

export const EMAIL_FROM = 'Nathan <hello@njil.dev>'

export const SITE_URL = 'https://www.njil.dev'
