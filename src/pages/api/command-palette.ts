import type { APIRoute } from 'astro'
import { commandPalette } from '@lib/command-palette/live'

// Jobs and Blog posts for the Command palette, fetched when it first opens
export const GET: APIRoute = async () => {
	try {
		const entries = await commandPalette.listEntries()
		return Response.json(entries, {
			headers: { 'Cache-Control': 'public, max-age=300' },
		})
	} catch (error) {
		console.error('Command palette entries unavailable:', error)
		return Response.json({ error: 'unavailable' }, { status: 500 })
	}
}
