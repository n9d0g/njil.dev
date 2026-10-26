import type { SanityClient } from '@sanity/client'
import { defineQuery } from 'groq'
import type {
	ActiveSubscribersQueryResult,
	Subscriber as SubscriberDocument,
} from '@app-types/sanity.types'
import type { NewsletterStore } from '../index'

export const activeSubscribersQuery = defineQuery(
	`*[_type == "subscriber" && active == true]{ email, active }`
)

export const blogAnnouncedQuery = defineQuery(
	`defined(*[_type == "blog" && _id == $id][0].announcedAt)`
)

// Ids are derived from the email so concurrent saves can't duplicate a
// Subscriber, and the "." keeps them out of the public dataset (ADR-0001)
export async function subscriberId(email: string) {
	const digest = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(email)
	)
	const hex = Array.from(new Uint8Array(digest), (b) =>
		b.toString(16).padStart(2, '0')
	).join('')
	return `subscriber.${hex}`
}

export function createSanityStore(client: SanityClient): NewsletterStore {
	return {
		async find(email) {
			const doc = await client.getDocument<SubscriberDocument>(
				await subscriberId(email)
			)
			if (!doc?.email) return null
			return {
				email: doc.email,
				active: doc.active ?? false,
				subscribedAt: doc.subscribedAt ?? doc._createdAt,
			}
		},

		async save(subscriber) {
			await client.createOrReplace({
				_id: await subscriberId(subscriber.email),
				_type: 'subscriber',
				...subscriber,
			})
		},

		async listActive() {
			const docs = await client.fetch<ActiveSubscribersQueryResult>(
				activeSubscribersQuery
			)
			return docs.flatMap(({ email }) =>
				email ? [{ email, active: true, subscribedAt: '' }] : []
			)
		},

		async hasAnnounced(postId) {
			return client.fetch<boolean>(blogAnnouncedQuery, { id: postId })
		},

		async markAnnounced(postId) {
			await client
				.patch(postId)
				.set({ announcedAt: new Date().toISOString() })
				.commit()
		},
	}
}
