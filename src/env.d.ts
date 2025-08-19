/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
	readonly GOOGLE_RECAPTCHA_SITE_KEY: string
	readonly GOOGLE_RECAPTCHA_SECRET_KEY: string
	readonly EMAIL_USER: string
	readonly EMAIL_PASS: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
