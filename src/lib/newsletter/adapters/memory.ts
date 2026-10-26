import type { NewsletterStore, Subscriber } from '../index'

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
