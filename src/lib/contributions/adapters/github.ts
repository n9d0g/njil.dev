import type { Calendar, ContributionSource } from '../index'

const query = `query ($login: String!) {
	user(login: $login) {
		contributionsCollection {
			contributionCalendar {
				totalContributions
				weeks { contributionDays { date contributionCount contributionLevel } }
			}
		}
	}
}`

// token: a fine-grained personal access token; public data needs no scopes
export function createGitHubSource(
	token: string | undefined
): ContributionSource {
	return {
		async getCalendar(login) {
			if (!token) throw new Error('GITHUB_TOKEN is not set')

			const response = await fetch('https://api.github.com/graphql', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
					'User-Agent': 'njil.dev',
				},
				body: JSON.stringify({ query, variables: { login } }),
			})
			if (!response.ok) throw new Error(`GitHub responded ${response.status}`)

			const { data, errors } = await response.json()
			if (errors?.length) throw new Error(errors[0].message)

			return data.user.contributionsCollection.contributionCalendar as Calendar
		},
	}
}
