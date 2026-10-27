import { createElement } from 'react'
import { ContactEmail } from '@emails/Contact'
import type { HumanCheck } from '@lib/human-check'
import type { Mailer } from '@lib/mail'

export interface ContactMessage {
	name?: string
	email: string
	message: string
}

export interface ContactConfig {
	mailer: Mailer
	humanCheck: HumanCheck
	from: string
	to: string
}

export type SendOutcome =
	| { kind: 'sent' }
	| { kind: 'invalid-email' }
	| { kind: 'too-long' }
	| { kind: 'not-human' }
	| { kind: 'failed' }

export const MAX_NAME_LENGTH = 100
export const MAX_MESSAGE_LENGTH = 5000

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createContact({ mailer, humanCheck, from, to }: ContactConfig) {
	// Only ever emails Nathan: mailing the visitor's address would let anyone
	// use the form to send email to a third party
	async function send(
		{ name, email, message }: ContactMessage,
		humanToken: string
	): Promise<SendOutcome> {
		if (!(await humanCheck.verify(humanToken))) return { kind: 'not-human' }
		if (!EMAIL_PATTERN.test(email)) return { kind: 'invalid-email' }
		if (
			(name?.length ?? 0) > MAX_NAME_LENGTH ||
			message.length > MAX_MESSAGE_LENGTH
		) {
			return { kind: 'too-long' }
		}

		const { failed } = await mailer.send([
			{
				from,
				to,
				replyTo: email,
				subject: `Contact message from ${name || email}`,
				react: createElement(ContactEmail, { name, email, message }),
			},
		])
		if (failed > 0) {
			console.error(`Contact message from ${email} failed to send`)
			return { kind: 'failed' }
		}

		return { kind: 'sent' }
	}

	return { send }
}

export type Contact = ReturnType<typeof createContact>
