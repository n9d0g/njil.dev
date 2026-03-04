import type { APIRoute } from 'astro'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { WelcomeEmail } from '@emails/Welcome'

const sanityClient = createClient({
	projectId: import.meta.env.SANITY_PROJECT_ID || 'nbid6gbs',
	dataset: 'production',
	apiVersion: '2024-01-01',
	token: import.meta.env.SANITY_API_KEY,
	useCdn: false,
})

const resend = new Resend(import.meta.env.RESEND_API_KEY)

export const POST: APIRoute = async ({ request }) => {
	try {
		const body = await request.json()
		const { email, recaptchaToken } = body

		if (!email || typeof email !== 'string') {
			return new Response(JSON.stringify({ error: 'email is required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			})
		}

		// Verify reCAPTCHA token
		if (!recaptchaToken) {
			return new Response(
				JSON.stringify({ error: 'reCAPTCHA verification failed' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			)
		}

		const recaptchaResponse = await fetch(
			'https://www.google.com/recaptcha/api/siteverify',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({
					secret: import.meta.env.RECAPTCHA_SECRET_KEY,
					response: recaptchaToken,
				}),
			}
		)

		const recaptchaData = await recaptchaResponse.json()

		if (!recaptchaData.success || recaptchaData.score < 0.5) {
			return new Response(
				JSON.stringify({ error: 'reCAPTCHA verification failed' }),
				{ status: 403, headers: { 'Content-Type': 'application/json' } }
			)
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return new Response(
				JSON.stringify({ error: 'please enter a valid email address' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			)
		}

		// Check if email already exists
		const existingSubscriber = await sanityClient.fetch(
			`*[_type == "subscriber" && email == $email][0]`,
			{ email: email.toLowerCase() }
		)

		if (existingSubscriber) {
			return new Response(
				JSON.stringify({ message: "you're already subscribed 🫨" }),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		}

		// Create new subscriber document in Sanity
		await sanityClient.create({
			_type: 'subscriber',
			email: email.toLowerCase(),
			subscribedAt: new Date().toISOString(),
			active: true,
		})

		// Send welcome email via Resend
		await resend.emails.send({
			from: 'nate <hello@njil.dev>',
			to: email.toLowerCase(),
			subject: 'thanks for subscribing to my blog newsletter 🫶',
			react: WelcomeEmail({ email: email.toLowerCase() }),
		})

		return new Response(
			JSON.stringify({ message: 'thanks for subscribing to my newsletter 🫶' }),
			{ status: 201, headers: { 'Content-Type': 'application/json' } }
		)
	} catch (error) {
		console.error('Newsletter subscription error:', error)
		return new Response(
			JSON.stringify({ error: 'something went wrong, please try again' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		)
	}
}
