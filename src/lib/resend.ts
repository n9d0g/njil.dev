import { RESEND_API_KEY } from 'astro:env/server'
import { Resend } from 'resend'

let resendClient: Resend | undefined

export function getResend() {
	if (!resendClient) {
		resendClient = new Resend(RESEND_API_KEY)
	}
	return resendClient
}

export const EMAIL_FROM = 'Nathan <hello@njil.dev>'

export const SITE_URL = 'https://www.njil.dev'
