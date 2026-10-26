import type { SanityClient } from '@sanity/client'
import { defineQuery } from 'groq'
import type {
	ActiveSubscribersQueryResult,
	SubscriberByEmailQueryResult,
} from '@app-types/sanity.types'
import type { Subscriber, SubscriberStore } from '../index'

export const subscriberByEmailQuery = defineQuery(
	`*[_type == "subscriber" && email == $email][0]`
)

export const activeSubscribersQuery = defineQuery(
	`*[_type == "subscriber" && active == true]{ email, active }`
)

export function createSanityStore(client: SanityClient): SubscriberStore {
	const findDocument = (email: string) =>
		client.fetch<SubscriberByEmailQueryResult>(subscriberByEmailQuery, {
			email,
		})

	return {
		async find(email) {
			const doc = await findDocument(email)
			if (!doc?.email) return null
			return {
				email: doc.email,
				active: doc.active ?? false,
				subscribedAt: doc.subscribedAt ?? doc._createdAt,
			}
		},

		async save(subscriber: Subscriber) {
			const existing = await findDocument(subscriber.email)
			if (existing) {
				await client.patch(existing._id).set(subscriber).commit()
			} else {
				await client.create({ _type: 'subscriber', ...subscriber })
			}
		},

		async listActive() {
			const docs = await client.fetch<ActiveSubscribersQueryResult>(
				activeSubscribersQuery
			)
			return docs.flatMap(({ email }) =>
				email ? [{ email, active: true, subscribedAt: '' }] : []
			)
		},
	}
}
