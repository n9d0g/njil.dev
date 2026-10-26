import { describe, expect, test } from 'vite-plus/test'
import { subscriberId } from './sanity-store'

describe('subscriberId', () => {
	// Changing the id format orphans every existing Subscriber (ADR-0001)
	test('is "subscriber." + the SHA-256 of the normalised email', async () => {
		expect(await subscriberId('nate@example.com')).toBe(
			'subscriber.c981385b2859c57077f7c2d0ed432dcb46210e5b1f861ded8fe7ea15623be01a'
		)
	})
})
