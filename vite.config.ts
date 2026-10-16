import { defineConfig } from 'vite-plus'

export default defineConfig({
	staged: {
		'*': 'vp check --fix',
	},
	lint: {
		plugins: ['typescript'],
		jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
		ignorePatterns: ['dist/**', '.astro/**', 'cms/dist/**', 'cms/.sanity/**'],
		rules: {
			'vite-plus/prefer-vite-plus-imports': 'error',
		},
		options: {
			typeAware: true,
			typeCheck: true,
		},
		overrides: [
			{
				// Sanity Studio — replaces @sanity/eslint-config-studio
				files: ['cms/**'],
				plugins: ['react', 'jsx-a11y'],
				env: { browser: true },
			},
		],
	},
	fmt: {
		useTabs: true,
		singleQuote: true,
		trailingComma: 'es5',
		printWidth: 80,
		semi: false,
		ignorePatterns: [
			// generated files
			'CHANGELOG.md',
			'.release-please-manifest.json',
			'src/types/sanity.types.ts',
			'cms/schema.json',
		],
	},
})
