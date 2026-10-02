export interface SanityWebhookPayload {
	_id: string
	_type: string
	title?: string
	slug?: { current: string }
	description?: string
}
