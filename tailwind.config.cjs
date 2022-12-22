/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'colour-theme-1': 'var(--colour-theme-1)',
        'colour-theme-2': 'var(--colour-theme-2)',
        'colour-text': 'var(--colour-text)',
      },
    },
  },
  plugins: [],
}
