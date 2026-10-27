import { GITHUB_TOKEN } from 'astro:env/server'
import { createContributions } from './index'
import { createEdgeCache } from './adapters/edge-cache'
import { createGitHubSource } from './adapters/github'

// Wires Contributions to its production adapters. Tests use the memory adapters.
export function getContributions() {
	return createContributions({
		source: createGitHubSource(GITHUB_TOKEN),
		cache: createEdgeCache(60 * 60),
		login: 'n9d0g',
	})
}
