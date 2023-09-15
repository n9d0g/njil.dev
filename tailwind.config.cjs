/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			minHeight: {
				main: 'calc(100vh - 112px)',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
