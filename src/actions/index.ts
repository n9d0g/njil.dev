import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'
import nodemailer from 'nodemailer'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.instanceof(FormData),
		handler: async (data: FormData) => {
			console.log('contact action')

			const recaptchaSecretKey = import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY
			const emailUser = import.meta.env.EMAIL_USER
			const emailPassword = import.meta.env.EMAIL_PASS
			const name = (data.get('name') as string) ?? ''
			const email = (data.get('email') as string) ?? ''
			const message = (data.get('message') as string) ?? ''

			try {
				if (!emailUser || !emailPassword) {
					throw new ActionError({
						message: 'Missing email environment variables.',
						code: 'INTERNAL_SERVER_ERROR',
					})
				}

				// recaptcha
				const token = data.get('token')
				const response = await fetch(
					`https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecretKey}&response=${token}`
				)
				const recaptchaData = await response.json()

				if (!recaptchaData.success || recaptchaData.score < 0.7) {
					throw new ActionError({
						message: 'Recaptcha verification failed',
						code: 'BAD_REQUEST',
					})
				}

				// nodemailer
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: { user: emailUser, pass: emailPassword },
				})

				const mailOptions = {
					from: emailUser,
					to: emailUser,
					bcc: 'nathanjlardizabal@gmail.com',
					subject: 'Contact Form Submission (njil.dev)',
					html: `
					<section>
						<p>Name: ${name}</p>
						<p>Email: ${email}</p>
						<p>Message: ${message}</p>
					</section>
				`,
				}

				await transporter.sendMail(mailOptions)

				console.log('Email sent successfully')
				return {
					message: 'Email sent successfully',
				}
			} catch (error) {
				console.error(error)
				throw error
			}
		},
	}),
}
