import type { Mailer, Message } from '../index'

export function createRecordingMailer({
	failFor = [],
}: { failFor?: string[] } = {}) {
	const sent: Message[] = []
	const idempotencyKeys: string[] = []

	return {
		sent,
		idempotencyKeys,
		async send(messages, options) {
			if (options?.idempotencyKey) idempotencyKeys.push(options.idempotencyKey)
			const delivered = messages.filter((m) => !failFor.includes(m.to))
			sent.push(...delivered)
			return {
				sent: delivered.length,
				failed: messages.length - delivered.length,
			}
		},
	} satisfies Mailer & { sent: Message[]; idempotencyKeys: string[] }
}
