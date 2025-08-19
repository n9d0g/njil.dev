import type { APIRoute } from 'astro'
import * as nodemailer from 'nodemailer'

export const POST: APIRoute = async ({ request }) => {
	try {
		const formData = await request.formData()
		const name = formData.get('name')
		const email = formData.get('email')
		const message = formData.get('message')
		const recaptchaToken = formData.get('recaptchaToken')

		// Validate required fields
		if (!name || !email || !message || !recaptchaToken) {
			return new Response(
				JSON.stringify({
					message: 'Missing required fields',
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json',
					},
				}
			)
		}

		// // Verify reCAPTCHA token
		// const recaptchaResponse = await fetch(
		// 	'https://www.google.com/recaptcha/api/siteverify',
		// 	{
		// 		method: 'POST',
		// 		headers: {
		// 			'Content-Type': 'application/x-www-form-urlencoded',
		// 		},
		// 		body: new URLSearchParams({
		// 			secret: import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY,
		// 			response: recaptchaToken as string,
		// 		}),
		// 	}
		// )

		// const recaptchaResult = await recaptchaResponse.json()

		// if (!recaptchaResult.success) {
		// 	return new Response(
		// 		JSON.stringify({
		// 			message: 'reCAPTCHA verification failed',
		// 		}),
		// 		{
		// 			status: 400,
		// 			headers: {
		// 				'Content-Type': 'application/json',
		// 			},
		// 		}
		// 	)
		// }

		// Create transporter
		const transporter = nodemailer.createTransport({
			service: 'gmail', // or your email service
			auth: {
				user: import.meta.env.EMAIL_USER,
				pass: import.meta.env.EMAIL_PASS, // Use app password for Gmail
			},
		})

		// Email options
		const mailOptions = {
			from: import.meta.env.EMAIL_USER,
			to: import.meta.env.EMAIL_USER,
			subject: `New Contact Form Message from ${name}`,
			text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
			html: `
        <h3>New Contact Form Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
		}

		// Send email
		await transporter.sendMail(mailOptions)

		return new Response(
			JSON.stringify({
				message: 'Message sent successfully!',
			}),
			{
				status: 200,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
	} catch (error) {
		console.error('Email error:', error)
		return new Response(
			JSON.stringify({
				message: 'Error sending message',
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json',
				},
			}
		)
	}
}
