import { defineAction, ActionError } from 'astro:actions'
import { z } from 'astro:schema'
import { Resend } from 'resend'

export const server = {
	contact: defineAction({
		accept: 'form',
		input: z.instanceof(FormData),
		handler: async (data: FormData) => {
			try {
				const recaptchaSecretKey = import.meta.env.GOOGLE_RECAPTCHA_SECRET_KEY
				const name = (data.get('name') as string) ?? ''
				const email = (data.get('email') as string) ?? ''
				const message = (data.get('message') as string) ?? ''
				const resend = new Resend(import.meta.env.RESEND_API_KEY)
				const resendEmail = import.meta.env.RESEND_EMAIL

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

				// resend
				const { error: resendError } = await resend.emails.send({
					from: `njil.dev <${resendEmail}>`,
					to: ['nate@njil.dev'],
					subject: 'Contact Form Submission (njil.dev)',
					html: `
						<section>
							<p>Name: ${name}</p>
							<p>Email: ${email}</p>
							<p>Message: ${message}</p>
						</section>
					`,
				})

				if (resendError) {
					console.error(resendError)
					throw new ActionError({
						message: 'Failed to send email',
						code: 'INTERNAL_SERVER_ERROR',
					})
				}

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
