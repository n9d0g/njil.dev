import type {
	HumanCheck,
	Mailer,
	Message,
	NewsletterStore,
	Subscriber,
} from '../index'

export function createMemoryStore(initial: Subscriber[] = []) {
	const subscribers = new Map(initial.map((s) => [s.email, { ...s }]))
	const announced = new Set<string>()

	return {
		subscribers,
		async find(email) {
			return subscribers.get(email) ?? null
		},
		async save(subscriber) {
			subscribers.set(subscriber.email, { ...subscriber })
		},
		async listActive() {
			return [...subscribers.values()].filter((s) => s.active)
		},
		async hasAnnounced(postId) {
			return announced.has(postId)
		},
		async markAnnounced(postId) {
			announced.add(postId)
		},
	} satisfies NewsletterStore & { subscribers: Map<string, Subscriber> }
}

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

export function createStubHumanCheck(isHuman = true): HumanCheck {
	return { verify: async () => isHuman }
}
