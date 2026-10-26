import type { ReactElement } from 'react'

export interface Message {
	from: string
	to: string
	subject: string
	react: ReactElement
	headers?: Record<string, string>
}

export interface Mailer {
	send(
		messages: Message[],
		options?: { idempotencyKey?: string }
	): Promise<{ sent: number; failed: number }>
}
