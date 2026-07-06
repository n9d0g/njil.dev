import type { APIRoute } from 'astro'
import { WelcomeEmail } from '@emails/Welcome'
import { sanityClient } from '@lib/sanity'
import { EMAIL_FROM, resend } from '@lib/resend'

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

		if (
			!recaptchaData.success ||
			typeof recaptchaData.score !== 'number' ||
			recaptchaData.score < 0.5
		) {
			return new Response(
				JSON.stringify({ error: 'reCAPTCHA verification failed' }),
				{ status: 403, headers: { 'Content-Type': 'application/json' } }
			)
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return new Response(
				JSON.stringify({ error: 'please enter a valid email address' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			)
		}

		const normalizedEmail = email.toLowerCase()

		const existingSubscriber = await sanityClient.fetch(
			`*[_type == "subscriber" && email == $email][0]`,
			{ email: normalizedEmail }
		)

		if (existingSubscriber) {
			return new Response(
				JSON.stringify({ message: "you're already subscribed 🫨" }),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			)
		}

		await sanityClient.create({
			_type: 'subscriber',
			email: normalizedEmail,
			subscribedAt: new Date().toISOString(),
			active: true,
		})

		try {
			await resend.emails.send({
				from: EMAIL_FROM,
				to: normalizedEmail,
				subject: 'thanks for subscribing to my blog newsletter 🫶',
				react: WelcomeEmail(),
			})
		} catch (emailError) {
			console.error('Welcome email failed:', emailError)
		}

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
