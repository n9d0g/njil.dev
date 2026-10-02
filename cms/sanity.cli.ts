import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
	api: {
		projectId: 'nbid6gbs',
		dataset: 'production',
	},
	studioHost: 'njil',
	deployment: {
		autoUpdates: true,
		appId: 'npcm32eu6ehtc56qczrkeztm',
	},
})
