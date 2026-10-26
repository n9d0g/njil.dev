import { Resend } from 'resend'
import type { Mailer } from '../index'

// Resend's batch endpoint accepts at most 100 emails per call
const BATCH_SIZE = 100

export function createResendMailer(apiKey: string): Mailer {
	const resend = new Resend(apiKey)

	return {
		async send(messages) {
			let sent = 0
			let failed = 0

			for (let i = 0; i < messages.length; i += BATCH_SIZE) {
				const chunk = messages.slice(i, i + BATCH_SIZE)
				try {
					const { error } = await resend.batch.send(chunk)
					if (error) throw error
					sent += chunk.length
				} catch (error) {
					console.error('Resend batch failed:', error)
					failed += chunk.length
				}
			}

			return { sent, failed }
		},
	}
}
