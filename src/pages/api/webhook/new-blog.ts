import type { APIRoute } from 'astro'
import { NewBlogEmail } from '@emails/NewBlog'
import { sanityClient } from '@lib/sanity'
import { EMAIL_FROM, resend, SITE_URL } from '@lib/resend'
import type { SanityWebhookPayload, Subscriber } from '@app-types/sanity'

export const POST: APIRoute = async ({ request }) => {
	try {
		const webhookSecret = import.meta.env.SANITY_WEBHOOK_SECRET
		const signature = request.headers.get('sanity-webhook-signature')

		if (webhookSecret && signature !== webhookSecret) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const payload: SanityWebhookPayload = await request.json()

		if (payload._type !== 'blog') {
			return new Response(JSON.stringify({ message: 'Not a blog document' }), {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		const subscribers = await sanityClient.fetch<Subscriber[]>(
			`*[_type == "subscriber" && active == true]{ email, active }`
		)

		if (!subscribers?.length) {
			return new Response(
				JSON.stringify({ message: 'No subscribers to notify' }),
				{
					status: 200,
					headers: { 'Content-Type': 'application/json' },
				}
			)
		}

		const blogUrl = `${SITE_URL}/blog/${payload.slug?.current || ''}`
		const blogTitle = payload.title || 'New Blog Post'
		const blogDescription =
			payload.description || 'Check out my latest blog post!'

		const results = await Promise.allSettled(
			subscribers.map((subscriber) =>
				resend.emails.send({
					from: EMAIL_FROM,
					to: subscriber.email,
					subject: `New post: ${blogTitle}`,
					react: NewBlogEmail({
						title: blogTitle,
						description: blogDescription,
						blogUrl,
					}),
				})
			)
		)

		const sent = results.filter(
			(result) => result.status === 'fulfilled'
		).length
		const failed = results.length - sent

		if (failed > 0) {
			console.error(`${failed} newsletter email(s) failed to send`)
		}

		return new Response(
			JSON.stringify({
				message: `Newsletter sent to ${sent} subscriber(s)`,
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
