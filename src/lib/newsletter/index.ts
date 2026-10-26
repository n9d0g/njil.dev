import { isValidSignature } from '@sanity/webhook'
import { createElement, type ReactElement } from 'react'
import { NewBlogEmail } from '@emails/NewBlog'
import { WelcomeEmail } from '@emails/Welcome'

export interface Subscriber {
	email: string
	active: boolean
	subscribedAt: string
}

export interface NewsletterStore {
	find(email: string): Promise<Subscriber | null>
	save(subscriber: Subscriber): Promise<void>
	listActive(): Promise<Subscriber[]>
	hasAnnounced(postId: string): Promise<boolean>
	markAnnounced(postId: string): Promise<void>
}

export interface Message {
	from: string
	to: string
	subject: string
	react: ReactElement
	headers?: Record<string, string>
}

export interface Mailer {
	send(
		messages: Message[],
		options?: { idempotencyKey?: string }
	): Promise<{ sent: number; failed: number }>
}

export interface HumanCheck {
	verify(token: string): Promise<boolean>
}

export interface NewsletterConfig {
	store: NewsletterStore
	mailer: Mailer
	humanCheck: HumanCheck
	webhookSecret: string
	unsubscribeSecret: string
	siteUrl: string
	from: string
}

export type SubscribeOutcome =
	| { kind: 'subscribed' }
	| { kind: 'reactivated' }
	| { kind: 'already-subscribed' }
	| { kind: 'invalid-email' }
	| { kind: 'not-human' }

export type AnnounceOutcome =
	| { kind: 'announced'; sent: number; failed: number }
	| { kind: 'already-announced' }
	| { kind: 'no-subscribers' }
	| { kind: 'ignored' }
	| { kind: 'invalid-payload' }
	| { kind: 'unauthorized' }

export type UnsubscribeOutcome =
	| { kind: 'unsubscribed' }
	| { kind: 'invalid-token' }
	| { kind: 'not-found' }

interface BlogPostPayload {
	_id?: string
	_type: string
	title?: string
	slug?: { current?: string }
	description?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const toHex = (bytes: ArrayBuffer) =>
	Array.from(new Uint8Array(bytes), (b) =>
		b.toString(16).padStart(2, '0')
	).join('')

const fromHex = (hex: string) =>
	/^([0-9a-f]{2})+$/.test(hex)
		? new Uint8Array(hex.match(/../g)!.map((byte) => parseInt(byte, 16)))
		: null

export function createNewsletter({
	store,
	mailer,
	humanCheck,
	webhookSecret,
	unsubscribeSecret,
	siteUrl,
	from,
}: NewsletterConfig) {
	const unsubscribeKey = () =>
		crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(unsubscribeSecret),
			{ name: 'HMAC', hash: 'SHA-256' },
			false,
			['sign', 'verify']
		)

	// Unsubscribe tokens are an HMAC of the email: stateless and never expire
	async function unsubscribeLinks(email: string) {
		const token = toHex(
			await crypto.subtle.sign(
				'HMAC',
				await unsubscribeKey(),
				new TextEncoder().encode(email)
			)
		)
		const query = new URLSearchParams({ email, token })
		const oneClickUrl = `${siteUrl}/api/unsubscribe?${query}`
		return {
			pageUrl: `${siteUrl}/newsletter/unsubscribe?${query}`,
			headers: {
				'List-Unsubscribe': `<${oneClickUrl}>`,
				'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
			},
		}
	}

	async function subscribe(
		email: string,
		humanToken: string
	): Promise<SubscribeOutcome> {
		if (!(await humanCheck.verify(humanToken))) return { kind: 'not-human' }
		if (!EMAIL_PATTERN.test(email)) return { kind: 'invalid-email' }

		const normalizedEmail = email.toLowerCase()

		const existing = await store.find(normalizedEmail)
		if (existing?.active) return { kind: 'already-subscribed' }

		await store.save({
			email: normalizedEmail,
			active: true,
			subscribedAt: new Date().toISOString(),
		})

		const links = await unsubscribeLinks(normalizedEmail)
		const { failed } = await mailer.send([
			{
				from,
				to: normalizedEmail,
				subject: 'thanks for subscribing to my blog newsletter 🫶',
				react: createElement(WelcomeEmail, {
					blogUrl: `${siteUrl}/blog`,
					unsubscribeUrl: links.pageUrl,
				}),
				headers: links.headers,
			},
		])
		if (failed > 0) console.error(`Welcome email failed for ${normalizedEmail}`)

		return { kind: existing ? 'reactivated' : 'subscribed' }
	}

	async function announce(
		rawBody: string,
		signatureHeader: string | null
	): Promise<AnnounceOutcome> {
		if (
			!webhookSecret ||
			!signatureHeader ||
			!(await isValidSignature(rawBody, signatureHeader, webhookSecret))
		) {
			return { kind: 'unauthorized' }
		}

		const post: BlogPostPayload = JSON.parse(rawBody)

		if (post._type !== 'blog') return { kind: 'ignored' }
		if (!post._id || !post.slug?.current) return { kind: 'invalid-payload' }
		if (await store.hasAnnounced(post._id)) return { kind: 'already-announced' }

		const subscribers = await store.listActive()
		if (!subscribers.length) return { kind: 'no-subscribers' }

		const title = post.title || 'New Blog Post'
		const messages = await Promise.all(
			subscribers.map(async (subscriber) => {
				const links = await unsubscribeLinks(subscriber.email)
				return {
					from,
					to: subscriber.email,
					subject: `New post: ${title}`,
					react: createElement(NewBlogEmail, {
						title,
						description: post.description || 'Check out my latest blog post!',
						blogUrl: `${siteUrl}/blog/${post.slug!.current}`,
						siteUrl,
						unsubscribeUrl: links.pageUrl,
					}),
					headers: links.headers,
				}
			})
		)

		const { sent, failed } = await mailer.send(messages, {
			idempotencyKey: `announcement-${post._id}`,
		})
		if (failed > 0)
			console.error(`${failed} Announcement email(s) failed to send`)

		// Marked even after partial failure: a re-send would duplicate the
		// Announcement for everyone it did reach
		await store.markAnnounced(post._id)

		return { kind: 'announced', sent, failed }
	}

	async function unsubscribe(
		email: string,
		token: string
	): Promise<UnsubscribeOutcome> {
		const signature = fromHex(token)
		const valid =
			signature !== null &&
			(await crypto.subtle.verify(
				'HMAC',
				await unsubscribeKey(),
				signature,
				new TextEncoder().encode(email)
			))
		if (!valid) return { kind: 'invalid-token' }

		const subscriber = await store.find(email)
		if (!subscriber) return { kind: 'not-found' }

		await store.save({ ...subscriber, active: false })
		return { kind: 'unsubscribed' }
	}

	return { subscribe, announce, unsubscribe }
}

export type Newsletter = ReturnType<typeof createNewsletter>
