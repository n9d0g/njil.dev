import { describe, expect, test } from 'vite-plus/test'
import { createNewsletter, type Subscriber } from './index'
import {
	createMemoryStore,
	createRecordingMailer,
	createStubHumanCheck,
} from './adapters/memory'

const SECRET = 'webhook-secret'

const subscriber = (email: string, active = true): Subscriber => ({
	email,
	active,
	subscribedAt: '2026-01-01T00:00:00.000Z',
})

function setup({
	subscribers = [] as Subscriber[],
	isHuman = true,
	failFor = [] as string[],
} = {}) {
	const store = createMemoryStore(subscribers)
	const mailer = createRecordingMailer({ failFor })
	const newsletter = createNewsletter({
		store,
		mailer,
		humanCheck: createStubHumanCheck(isHuman),
		webhookSecret: SECRET,
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

	test('still subscribes when the Welcome email fails', async () => {
		const { newsletter, store } = setup({ failFor: ['nate@example.com'] })

		const outcome = await newsletter.subscribe('nate@example.com', 'token')

		expect(outcome).toEqual({ kind: 'subscribed' })
		expect(store.subscribers.has('nate@example.com')).toBe(true)
	})
})

describe('announce', () => {
	test('sends an Announcement to every active Subscriber', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [
				subscriber('a@example.com'),
				subscriber('b@example.com'),
				subscriber('gone@example.com', false),
			],
		})

		const outcome = await newsletter.announce(blogPost(), SECRET)

		expect(outcome).toEqual({ kind: 'announced', sent: 2, failed: 0 })
		expect(mailer.sent.map((m) => m.to)).toEqual([
			'a@example.com',
			'b@example.com',
		])
		expect(mailer.sent[0].subject).toBe('New post: Deep modules')
		expect(mailer.sent[0].react.props).toMatchObject({
			blogUrl: 'https://www.njil.dev/blog/deep-modules',
		})
	})

	test('falls back to a default title', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		await newsletter.announce(blogPost({ title: undefined }), SECRET)

		expect(mailer.sent[0].subject).toBe('New post: New Blog Post')
	})

	test('counts failed sends', async () => {
		const { newsletter } = setup({
			subscribers: [subscriber('a@example.com'), subscriber('b@example.com')],
			failFor: ['b@example.com'],
		})

		const outcome = await newsletter.announce(blogPost(), SECRET)

		expect(outcome).toEqual({ kind: 'announced', sent: 1, failed: 1 })
	})

	test('rejects a request with the wrong signature', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		const outcome = await newsletter.announce(blogPost(), 'wrong')

		expect(outcome).toEqual({ kind: 'unauthorized' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('ignores documents that are not Blog posts', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		const outcome = await newsletter.announce(
			blogPost({ _type: 'tag' }),
			SECRET
		)

		expect(outcome).toEqual({ kind: 'ignored' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('refuses to announce a Blog post without a slug', async () => {
		const { newsletter, mailer } = setup({
			subscribers: [subscriber('a@example.com')],
		})

		const outcome = await newsletter.announce(
			blogPost({ slug: undefined }),
			SECRET
		)

		expect(outcome).toEqual({ kind: 'invalid-payload' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('reports when there is nobody to announce to', async () => {
		const { newsletter } = setup({
			subscribers: [subscriber('gone@example.com', false)],
		})

		const outcome = await newsletter.announce(blogPost(), SECRET)

		expect(outcome).toEqual({ kind: 'no-subscribers' })
	})
})
