import type { APIRoute } from 'astro'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { NewBlogEmail } from '@emails/NewBlog'

const sanityClient = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID || 'nbid6gbs',
	dataset: 'production',
	apiVersion: '2024-01-01',
	token: import.meta.env.SANITY_API_KEY,
	useCdn: false,
})

const resend = new Resend(import.meta.env.RESEND_API_KEY)

interface SanityWebhookPayload {
	_id: string
	_type: string
	title?: string
	slug?: { current: string }
	description?: string
	author?: string
}

interface Subscriber {
	email: string
	active: boolean
}

export const POST: APIRoute = async ({ request }) => {
	try {
		// Verify the webhook secret (optional but recommended)
		const webhookSecret = import.meta.env.SANITY_WEBHOOK_SECRET
		const signature = request.headers.get('sanity-webhook-signature')

		if (webhookSecret && signature !== webhookSecret) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const payload: SanityWebhookPayload = await request.json()

		// Only process blog documents
		if (payload._type !== 'blog') {
			return new Response(JSON.stringify({ message: 'Not a blog document' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// Fetch all active subscribers
		const subscribers = await sanityClient.fetch<Subscriber[]>(
			`*[_type == "subscriber" && active == true]{ email, active }`
		)

		if (!subscribers || subscribers.length === 0) {
			return new Response(
				JSON.stringify({ message: 'No subscribers to notify' }),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			)
		}

		const blogUrl = `https://njil.dev/blog/${payload.slug?.current || ''}`
		const blogTitle = payload.title || 'New Blog Post'
		const blogDescription =
			payload.description || 'Check out my latest blog post!'

		// Send email to all subscribers
		const emailPromises = subscribers.map((subscriber) =>
			resend.emails.send({
				from: 'Nathan <hello@njil.dev>',
				to: subscriber.email,
				subject: `New post: ${blogTitle}`,
				react: NewBlogEmail({
					title: blogTitle,
					description: blogDescription,
					blogUrl: blogUrl,
				}),
			})
		)

		await Promise.all(emailPromises)

		return new Response(
			JSON.stringify({
				message: `Newsletter sent to ${subscribers.length} subscriber(s)`,
			}),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		)
	} catch (error) {
		console.error('Webhook error:', error)
		return new Response(
			JSON.stringify({ error: 'Failed to process webhook' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
}
