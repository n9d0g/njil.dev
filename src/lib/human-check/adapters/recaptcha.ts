import type { HumanCheck } from '../index'

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'
const MIN_SCORE = 0.5

export function createRecaptcha(secret: string, action: string): HumanCheck {
	return {
		async verify(token) {
			const response = await fetch(VERIFY_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: new URLSearchParams({ secret, response: token }),
			})
			const data = await response.json()

			return (
				data.success === true &&
				data.action === action &&
				typeof data.score === 'number' &&
				data.score >= MIN_SCORE
			)
		},
	}
}
