import type { APIRoute } from 'astro'
import type { UnsubscribeOutcome } from '@lib/newsletter'
import { getNewsletter } from '@lib/newsletter/live'

const statuses: Record<UnsubscribeOutcome['kind'], number> = {
	unsubscribed: 200,
	'invalid-token': 400,
	'not-found': 404,
}

// Handles both RFC 8058 one-click POSTs from mail providers and the button on
// /newsletter/unsubscribe, which is sent back to that page with the outcome
export const POST: APIRoute = async ({ request, url, redirect }) => {
	const form = await request.formData().catch(() => null)
	const fromPage = form?.get('from') === 'page'

	let kind: UnsubscribeOutcome['kind'] | 'error'
	try {
		const outcome = await getNewsletter().unsubscribe(
			url.searchParams.get('email') ?? '',
			url.searchParams.get('token') ?? ''
		)
		kind = outcome.kind
	} catch (error) {
		console.error('Unsubscribe error:', error)
		kind = 'error'
	}

	if (fromPage) return redirect(`/newsletter/unsubscribe?status=${kind}`, 303)
	return new Response(null, { status: kind === 'error' ? 500 : statuses[kind] })
}
