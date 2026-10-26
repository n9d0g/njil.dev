import type { APIRoute } from 'astro'
import type { SubscribeOutcome } from '@lib/newsletter'
import { getNewsletter } from '@lib/newsletter/live'

const json = (status: number, body: object) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

const responses: Record<SubscribeOutcome['kind'], [number, object]> = {
	subscribed: [201, { message: 'thanks for subscribing to my newsletter 🫶' }],
	'already-subscribed': [200, { message: "you're already subscribed 🫨" }],
	'invalid-email': [400, { error: 'please enter a valid email address' }],
	'not-human': [403, { error: 'reCAPTCHA verification failed' }],
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const { email, recaptchaToken } = await request.json()

		if (!email || typeof email !== 'string') {
			return json(400, { error: 'email is required' })
		}
		if (!recaptchaToken) {
			return json(400, { error: 'reCAPTCHA verification failed' })
		}

		const outcome = await getNewsletter().subscribe(email, recaptchaToken)
		return json(...responses[outcome.kind])
	} catch (error) {
		console.error('Newsletter subscription error:', error)
		return json(500, { error: 'something went wrong, please try again' })
	}
}
