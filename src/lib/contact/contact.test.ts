import { describe, expect, test } from 'vite-plus/test'
import { createStubHumanCheck } from '@lib/human-check/adapters/memory'
import { createRecordingMailer } from '@lib/mail/adapters/memory'
import { createContact, type ContactMessage } from './index'

const NATHAN = 'nate@njil.dev'

function setup({ isHuman = true, failFor = [] as string[] } = {}) {
	const mailer = createRecordingMailer({ failFor })
	const contact = createContact({
		mailer,
		humanCheck: createStubHumanCheck(isHuman),
		from: 'njil.dev <hello@njil.dev>',
		to: NATHAN,
	})
	return { contact, mailer }
}

const contactMessage = (
	overrides: Partial<ContactMessage> = {}
): ContactMessage => ({
	name: 'Ada',
	email: 'ada@example.com',
	message: 'Loved your post on deep modules!',
	...overrides,
})

describe('send', () => {
	test('emails the Contact message to Nathan, with Reply-To set to the visitor', async () => {
		const { contact, mailer } = setup()

		const outcome = await contact.send(contactMessage(), 'token')

		expect(outcome).toEqual({ kind: 'sent' })
		expect(mailer.sent).toHaveLength(1)
		expect(mailer.sent[0]).toMatchObject({
			from: 'njil.dev <hello@njil.dev>',
			to: NATHAN,
			replyTo: 'ada@example.com',
			subject: 'Contact message from Ada',
		})
	})

	test('falls back to the email in the subject when no name is given', async () => {
		const { contact, mailer } = setup()

		await contact.send(contactMessage({ name: '' }), 'token')

		expect(mailer.sent[0].subject).toBe('Contact message from ada@example.com')
	})

	test('never emails the visitor', async () => {
		const { contact, mailer } = setup()

		await contact.send(contactMessage(), 'token')

		expect(mailer.sent.map((m) => m.to)).toEqual([NATHAN])
	})

	test('sends nothing when the human check fails', async () => {
		const { contact, mailer } = setup({ isHuman: false })

		const outcome = await contact.send(contactMessage(), 'token')

		expect(outcome).toEqual({ kind: 'not-human' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('rejects an invalid email', async () => {
		const { contact, mailer } = setup()

		const outcome = await contact.send(
			contactMessage({ email: 'not-an-email' }),
			'token'
		)

		expect(outcome).toEqual({ kind: 'invalid-email' })
		expect(mailer.sent).toHaveLength(0)
	})

	test.each([
		['name', { name: 'a'.repeat(101) }],
		['message', { message: 'a'.repeat(5001) }],
	])('rejects a %s over the limit', async (_, overrides) => {
		const { contact, mailer } = setup()

		const outcome = await contact.send(contactMessage(overrides), 'token')

		expect(outcome).toEqual({ kind: 'too-long' })
		expect(mailer.sent).toHaveLength(0)
	})

	test('accepts a name and message exactly at the limit', async () => {
		const { contact } = setup()

		const outcome = await contact.send(
			contactMessage({ name: 'a'.repeat(100), message: 'a'.repeat(5000) }),
			'token'
		)

		expect(outcome).toEqual({ kind: 'sent' })
	})

	test('reports failure when the email to Nathan fails', async () => {
		const { contact } = setup({ failFor: [NATHAN] })

		const outcome = await contact.send(contactMessage(), 'token')

		expect(outcome).toEqual({ kind: 'failed' })
	})
})
