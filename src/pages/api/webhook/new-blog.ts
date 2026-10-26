import type { APIRoute } from 'astro'
import type { AnnounceOutcome } from '@lib/newsletter'
import { getNewsletter } from '@lib/newsletter/live'

const json = (status: number, body: object) =>
	new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' },
	})

const toResponse = (outcome: AnnounceOutcome) => {
	switch (outcome.kind) {
		case 'announced':
			return json(200, {
				message: `Newsletter sent to ${outcome.sent} subscriber(s)`,
			})
		case 'no-subscribers':
			return json(200, { message: 'No subscribers to notify' })
		case 'ignored':
			return json(200, { message: 'Not a blog document' })
		case 'invalid-payload':
			return json(400, { error: 'Blog post has no slug' })
		case 'unauthorized':
			return json(401, { error: 'Unauthorized' })
	}
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const outcome = await getNewsletter().announce(
			await request.text(),
			request.headers.get('sanity-webhook-signature')
		)
		return toResponse(outcome)
	} catch (error) {
		console.error('Webhook error:', error)
		return json(500, { error: 'Failed to process webhook' })
	}
}
