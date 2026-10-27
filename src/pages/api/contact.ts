import type { APIRoute } from 'astro'
import type { SendOutcome } from '@lib/contact'
import { getContact } from '@lib/contact/live'

const json = (status: number, body: object) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

const responses: Record<SendOutcome['kind'], [number, object]> = {
	sent: [201, { message: "thanks for reaching out! i'll get back to you 🫶" }],
	'invalid-email': [400, { error: 'please enter a valid email address' }],
	'too-long': [400, { error: 'your name or message is too long' }],
	'not-human': [403, { error: 'reCAPTCHA verification failed' }],
	failed: [500, { error: 'something went wrong, please try again' }],
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const { name, email, message, recaptchaToken } = await request.json()

		if (!email || typeof email !== 'string') {
			return json(400, { error: 'email is required' })
		}
		if (!message || typeof message !== 'string' || !message.trim()) {
			return json(400, { error: 'message is required' })
		}
		if (name !== undefined && typeof name !== 'string') {
			return json(400, { error: 'name must be text' })
		}
		if (!recaptchaToken) {
			return json(400, { error: 'reCAPTCHA verification failed' })
		}

		const outcome = await getContact().send(
			{ name: name?.trim(), email: email.trim(), message: message.trim() },
			recaptchaToken
		)
		return json(...responses[outcome.kind])
	} catch (error) {
		console.error('Contact message error:', error)
		return json(500, { error: 'something went wrong, please try again' })
	}
}
