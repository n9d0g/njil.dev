import { encodeSignatureHeader } from '@sanity/webhook'
import { describe, expect, test } from 'vite-plus/test'
import { createStubHumanCheck } from '@lib/human-check/adapters/memory'
import type { Message } from '@lib/mail'
import { createRecordingMailer } from '@lib/mail/adapters/memory'
import { createNewsletter, type Subscriber } from './index'
import { createMemoryStore } from './adapters/memory'

const SECRET = 'webhook-secret'

const subscriber = (email: string, active = true): Subscriber => ({
	email,
	active,
	subscribedAt: '2026-01-01T00:00:00.000Z',
})

// Reads the one-click unsubscribe link a Subscriber received
const unsubscribeLink = (message: Message) => {
	const url = new URL(message.headers!['List-Unsubscribe'].slice(1, -1))
	return {
		url,
		email: url.searchParams.get('email')!,
		token: url.searchParams.get('token')!,
	}
}

function setup({
	subscribers = [] as Subscriber[],
	isHuman = true,
	failFor = [] as string[],
	webhookSecret = SECRET,
} = {}) {
	const store = createMemoryStore(subscribers)
	const mailer = createRecordingMailer({ failFor })
	const newsletter = createNewsletter({
		store,
		mailer,
		humanCheck: createStubHumanCheck(isHuman),
		webhookSecret,
		unsubscribeSecret: 'unsubscribe-secret',
		siteUrl: 'https://www.njil.dev',
		from: 'Nathan <hello@njil.dev>',
	})
	return { newsletter, store, mailer }
}

const blogPost = (overrides: object = {}) =>
	JSON.stringify({
		_id: 'post-1',
		_type: 'blog',
		title: 'Deep modules',
		slug: { current: 'deep-modules' },
		description: 'Small interfaces, lots of behaviour',
		...overrides,
	})

describe('subscribe', () => {
	test('adds a new Subscriber, lowercased, and sends a Welcome email', async () => {
		const { newsletter, store, mailer } = setup()

		const outcome = await newsletter.subscribe('Nate@Example.com', 'token')

		expect(outcome).toEqual({ kind: 'subscribed' })
		expect(store.subscribers.get('nate@example.com')?.active).toBe(true)
		expect(mailer.sent).toHaveLength(1)
		expect(mailer.sent[0]).toMatchObject({
			to: 'nate@example.com',
			subject: 'thanks for subscribing to my blog newsletter 🫶',
		})
	})

	test('rejects a token that fails the human check', async () => {
		const { newsletter, store, mailer } = setup({ isHuman: false })

		const outcome = await newsletter.subscribe('nate@example.com', 'token')

		expect(outcome).toEqual({ kind: 'not-human' })
		expect(store.subscribers.size).toBe(0)
		expect(mailer.sent).toHaveLength(0)
	})

	test('rejects a malformed email', async () => {
		const { newsletter, store } = setup()

		const outcome = await newsletter.subscribe('not-an-email', 'token')

		expect(outcome).toEqual({ kind: 'invalid-email' })
		expect(store.subscribers.size).toBe(0)
	})

	test('does not duplicate an active Subscriber or re-send the Welcome email', async () => {
		const { newsletter, store, mailer } = setup({
			subscribers: [subscriber('nate@example.com')],
		})

		const outcome = await newsletter.subscribe('NATE@example.com', 'token')

		expect(outcome).toEqual({ kind: 'already-subscribed' })
		expect(store.subscribers.size).toBe(1)
		expect(mailer.sent).toHaveLength(0)
	})

	test('reactivates an inactive Subscriber and welcomes them back', async () => {
		const { newsletter, store, mailer } = setup({
			subscribers: [subscriber('nate@example.com', false)],
		})

		const outcome = await newsletter.subscribe('nate@example.com', 'token')

		expect(outcome).toEqual({ kind: 'reactivated' })
		expect(store.subscribers.size).toBe(1)
		expect(store.subscribers.get('nate@example.com')).toMatchObject({
			active: true,
			subscribedAt: expect.not.stringMatching(/^2026-01-01/),
		})
		expect(mailer.sent.map((m) => m.to)).toEqual(['nate@example.com'])
	})

	test('still subscribes when the Welcome email fails', async () => {
		const { newsletter, store } = setup({ failFor: ['nate@example.com'] })

		const outcome = await newsletter.subscribe('nate@example.com', 'token')

		expect(outcome).toEqual({ kind: 'subscribed' })
		expect(store.subscribers.has('nate@example.com')).toBe(true)
	})
})

// Signs a body the way Sanity's GROQ webhooks do
const sign = (body: string, secret = SECRET) =>
	encodeSignatureHeader(body, Date.now(), secret)

const announceSigned = async (
	newsletter: ReturnType<typeof setup>['newsletter'],
	body = blogPost()
) => newsletter.announce(body, await sign(body))

describe('announce', () => {
	test('sends an Announcement to every active Subscriber', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [
				subscriber('a@example.com'),
				subscriber('b@example.com'),
				subscriber('gone@example.com', false),
			],
		})

		const outcome = await announceSigned(newsletter)

		expect(outcome).toEqual({ kind: 'announced', sent: 2, failed: 0 })
		expect(mailer.sent.map((m) => m.to)).toEqual([
			'a@example.com',
			'b@example.com',
		])
		expect(mailer.sent[0].subject).toBe('New post: Deep modules')
		expect(mailer.sent[0].react.props).toMatchObject({
			blogUrl: 'https://www.njil.dev/blog/deep-modules/',
		})
	})

	test('falls back to a default title', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		await announceSigned(newsletter, blogPost({ title: undefined }))

		expect(mailer.sent[0].subject).toBe('New post: New Blog Post')
	})

	test('counts failed sends', async () => {
		const { newsletter } = setup({
			subscribers: [subscriber('a@example.com'), subscriber('b@example.com')],
			failFor: ['b@example.com'],
		})

		const outcome = await announceSigned(newsletter)

		expect(outcome).toEqual({ kind: 'announced', sent: 1, failed: 1 })
	})

	describe('rejects requests not signed by Sanity with our secret', () => {
		const cases: [string, (body: string) => Promise<string | null>][] = [
			['no signature header', async () => null],
			['the bare secret as the header', async () => SECRET],
			['a signature made with another secret', (body) => sign(body, 'other')],
			[
				'a signature for a different body',
				() => sign(blogPost({ title: 'Spam' })),
			],
			['a malformed header', async () => 't=abc,v1='],
		]

		test.each(cases)('%s', async (_, signatureFor) => {
			const { newsletter, mailer } = setup({
				subscribers: [subscriber('a@example.com')],
			})
			const body = blogPost()

			const outcome = await newsletter.announce(body, await signatureFor(body))

			expect(outcome).toEqual({ kind: 'unauthorized' })
			expect(mailer.sent).toHaveLength(0)
		})
	})

	test('rejects every request when no webhook secret is configured', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
			webhookSecret: '',
		})
		const body = blogPost()

		const outcome = await newsletter.announce(body, await sign(body))

		expect(outcome).toEqual({ kind: 'unauthorized' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('ignores documents that are not Blog posts', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		const outcome = await announceSigned(newsletter, blogPost({ _type: 'tag' }))

		expect(outcome).toEqual({ kind: 'ignored' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('refuses to announce a Blog post without a slug', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		const outcome = await announceSigned(
			newsletter,
			blogPost({ slug: undefined })
		)

		expect(outcome).toEqual({ kind: 'invalid-payload' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('gives every Announcement a one-click unsubscribe link for its Subscriber', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com'), subscriber('b@example.com')],
		})

		await announceSigned(newsletter)

		for (const message of mailer.sent) {
			const link = unsubscribeLink(message)
			expect(link.url.origin + link.url.pathname).toBe(
				'https://www.njil.dev/api/unsubscribe'
			)
			expect(link.email).toBe(message.to)
			expect(message.headers!['List-Unsubscribe-Post']).toBe(
				'List-Unsubscribe=One-Click'
			)
			expect(message.react.props).toMatchObject({
				unsubscribeUrl: expect.stringMatching(
					/^https:\/\/www\.njil\.dev\/newsletter\/unsubscribe\?/
				),
			})
		}
		expect(unsubscribeLink(mailer.sent[0]).token).not.toBe(
			unsubscribeLink(mailer.sent[1]).token
		)
	})

	test('announces each Blog post at most once', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		await announceSigned(newsletter)
		const again = await announceSigned(newsletter)

		expect(again).toEqual({ kind: 'already-announced' })
		expect(mailer.sent).toHaveLength(1)
	})

	test('sends with an idempotency key for the Blog post', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		await announceSigned(newsletter)

		expect(mailer.idempotencyKeys).toEqual(['announcement-post-1'])
	})

	test('reports when there is nobody to announce to', async () => {
		const { newsletter } = setup({
			subscribers: [subscriber('gone@example.com', false)],
		})

		const outcome = await announceSigned(newsletter)

		expect(outcome).toEqual({ kind: 'no-subscribers' })
	})
})

describe('unsubscribe', () => {
	test('deactivates the Subscriber from the link in their Welcome email', async () => {
		const { newsletter, store, mailer } = setup()
		await newsletter.subscribe('nate@example.com', 'token')
		const { email, token } = unsubscribeLink(mailer.sent[0])

		const outcome = await newsletter.unsubscribe(email, token)

		expect(outcome).toEqual({ kind: 'unsubscribed' })
		expect(store.subscribers.get('nate@example.com')?.active).toBe(false)
	})

	test('rejects a tampered token', async () => {
		const { newsletter, store, mailer } = setup()
		await newsletter.subscribe('nate@example.com', 'token')
		const { email, token } = unsubscribeLink(mailer.sent[0])

		const outcome = await newsletter.unsubscribe(
			email,
			token.replace(/.$/, 'x')
		)

		expect(outcome).toEqual({ kind: 'invalid-token' })
		expect(store.subscribers.get('nate@example.com')?.active).toBe(true)
	})

	test("rejects one Subscriber's token used for another", async () => {
		const { newsletter, store, mailer } = setup()
		await newsletter.subscribe('a@example.com', 'token')
		await newsletter.subscribe('b@example.com', 'token')
		const { token } = unsubscribeLink(mailer.sent[0])

		const outcome = await newsletter.unsubscribe('b@example.com', token)

		expect(outcome).toEqual({ kind: 'invalid-token' })
		expect(store.subscribers.get('b@example.com')?.active).toBe(true)
	})

	test('reports a Subscriber that no longer exists', async () => {
		const { newsletter, store, mailer } = setup()
		await newsletter.subscribe('nate@example.com', 'token')
		const { email, token } = unsubscribeLink(mailer.sent[0])
		store.subscribers.clear()

		const outcome = await newsletter.unsubscribe(email, token)

		expect(outcome).toEqual({ kind: 'not-found' })
	})

	test('stops Announcements to that Subscriber', async () => {
		const { newsletter, mailer } = setup()
		await newsletter.subscribe('a@example.com', 'token')
		await newsletter.subscribe('b@example.com', 'token')
		const { email, token } = unsubscribeLink(mailer.sent[0])
		await newsletter.unsubscribe(email, token)
		mailer.sent.length = 0

		await announceSigned(newsletter)

		expect(mailer.sent.map((m) => m.to)).toEqual(['b@example.com'])
	})
})
