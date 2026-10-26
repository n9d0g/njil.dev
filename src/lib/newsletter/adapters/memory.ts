import type {
	HumanCheck,
	Mailer,
	Message,
	Subscriber,
	SubscriberStore,
} from '../index'

export function createMemoryStore(initial: Subscriber[] = []) {
	const subscribers = new Map(initial.map((s) => [s.email, { ...s }]))

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
	} satisfies SubscriberStore & { subscribers: Map<string, Subscriber> }
}

export function createRecordingMailer({
	failFor = [],
}: { failFor?: string[] } = {}) {
	const sent: Message[] = []

	return {
		sent,
		async send(messages) {
			const delivered = messages.filter((m) => !failFor.includes(m.to))
			sent.push(...delivered)
			return {
				sent: delivered.length,
				failed: messages.length - delivered.length,
			}
		},
	} satisfies Mailer & { sent: Message[] }
}

export function createStubHumanCheck(isHuman = true): HumanCheck {
	return { verify: async () => isHuman }
}
