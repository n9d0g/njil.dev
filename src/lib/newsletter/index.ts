import { createElement, type ReactElement } from 'react'
import { NewBlogEmail } from '@emails/NewBlog'
import { WelcomeEmail } from '@emails/Welcome'

export interface Subscriber {
	email: string
	active: boolean
	subscribedAt: string
}

export interface SubscriberStore {
	find(email: string): Promise<Subscriber | null>
	save(subscriber: Subscriber): Promise<void>
	listActive(): Promise<Subscriber[]>
}

export interface Message {
	from: string
	to: string
	subject: string
	react: ReactElement
	headers?: Record<string, string>
}

export interface Mailer {
	send(messages: Message[]): Promise<{ sent: number; failed: number }>
}

export interface HumanCheck {
	verify(token: string): Promise<boolean>
}

export interface NewsletterConfig {
	store: SubscriberStore
	mailer: Mailer
	humanCheck: HumanCheck
	webhookSecret?: string
	siteUrl: string
	from: string
}

export type SubscribeOutcome =
	| { kind: 'subscribed' }
	| { kind: 'already-subscribed' }
	| { kind: 'invalid-email' }
	| { kind: 'not-human' }

export type AnnounceOutcome =
	| { kind: 'announced'; sent: number; failed: number }
	| { kind: 'no-subscribers' }
	| { kind: 'ignored' }
	| { kind: 'invalid-payload' }
	| { kind: 'unauthorized' }

interface BlogPostPayload {
	_id: string
	_type: string
	title?: string
	slug?: { current?: string }
	description?: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function createNewsletter({
	store,
	mailer,
	humanCheck,
	webhookSecret,
	siteUrl,
	from,
}: NewsletterConfig) {
	async function subscribe(
		email: string,
		humanToken: string
	): Promise<SubscribeOutcome> {
		if (!(await humanCheck.verify(humanToken))) return { kind: 'not-human' }
		if (!EMAIL_PATTERN.test(email)) return { kind: 'invalid-email' }

		const normalizedEmail = email.toLowerCase()

		if (await store.find(normalizedEmail)) {
			return { kind: 'already-subscribed' }
		}

		await store.save({
			email: normalizedEmail,
			active: true,
			subscribedAt: new Date().toISOString(),
		})

		const { failed } = await mailer.send([
			{
				from,
				to: normalizedEmail,
				subject: 'thanks for subscribing to my blog newsletter 🫶',
				react: createElement(WelcomeEmail, { blogUrl: `${siteUrl}/blog` }),
			},
		])
		if (failed > 0) console.error(`Welcome email failed for ${normalizedEmail}`)

		return { kind: 'subscribed' }
	}

	async function announce(
		rawBody: string,
		signatureHeader: string | null
	): Promise<AnnounceOutcome> {
		if (webhookSecret && signatureHeader !== webhookSecret) {
			return { kind: 'unauthorized' }
		}

		const post: BlogPostPayload = JSON.parse(rawBody)

		if (post._type !== 'blog') return { kind: 'ignored' }
		if (!post.slug?.current) return { kind: 'invalid-payload' }

		const subscribers = await store.listActive()
		if (!subscribers.length) return { kind: 'no-subscribers' }

		const title = post.title || 'New Blog Post'
		const email = createElement(NewBlogEmail, {
			title,
			description: post.description || 'Check out my latest blog post!',
			blogUrl: `${siteUrl}/blog/${post.slug.current}`,
			siteUrl,
		})

		const { sent, failed } = await mailer.send(
			subscribers.map((subscriber) => ({
				from,
				to: subscriber.email,
				subject: `New post: ${title}`,
				react: email,
			}))
		)
		if (failed > 0)
			console.error(`${failed} Announcement email(s) failed to send`)

		return { kind: 'announced', sent, failed }
	}

	return { subscribe, announce }
}

export type Newsletter = ReturnType<typeof createNewsletter>
