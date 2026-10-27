import { PUBLIC_RECAPTCHA_SITE_KEY } from 'astro:env/client'

declare global {
	interface Window {
		onRecaptchaLoad?: () => void
	}
	const grecaptcha: {
		render(
			container: HTMLElement,
			params: { sitekey: string; size: 'invisible' }
		): number
		execute(widgetId: number, options: { action: string }): Promise<string>
	}
}

const loaded = new Promise<void>((resolve) => {
	window.onRecaptchaLoad = resolve
	const script = document.createElement('script')
	script.src =
		'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoad'
	script.async = true
	document.head.append(script)
})

// Page transitions swap out <body>, and the widget's iframe with it, so every
// page gets a fresh widget (ADR-0003)
let widgetId: Promise<number> | undefined
document.addEventListener('astro:page-load', () => {
	const container = document.createElement('div')
	document.body.append(container)
	widgetId = loaded.then(() =>
		grecaptcha.render(container, {
			sitekey: PUBLIC_RECAPTCHA_SITE_KEY,
			size: 'invisible',
		})
	)
})

// A reCAPTCHA token for the server's HumanCheck to verify
export async function humanCheckToken(action: string) {
	return grecaptcha.execute(await widgetId!, { action })
}
