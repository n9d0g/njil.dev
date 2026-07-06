import { Resend } from 'resend'

export const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const EMAIL_FROM = 'Nathan <hello@njil.dev>'

export const SITE_URL = 'https://www.njil.dev'
