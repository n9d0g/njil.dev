/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			minHeight: {
				main: 'calc(100vh - 112px)',
			},
			colors: {
				gh0: '#2c333b',
				gh1: '#00442a',
				gh2: '#006d35',
				gh3: '#00a648',
				gh4: '#00d35c',
			},
		},
	},
	plugins: [require('@tailwindcss/typography')],
}
