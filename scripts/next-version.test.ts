import { expect, test } from 'vite-plus/test'
import { nextVersion } from './next-version.ts'

test.each([
	['2.9.0', ['feat(bets): unlisted Bet counter'], '2.10.0'],
	['2.9.3', ['fix(home): a typo'], '2.9.4'],
	['2.9.0', ['perf: faster'], '2.9.1'],
	['2.9.0', ['chore: tidy', 'docs: a note', 'test: more'], null],
	['2.9.0', ['Merge pull request #118 from n9d0g/dev'], null],
	// a dev → main merge brings every commit with it: the biggest bump wins
	[
		'2.9.0',
		['Merge pull request #120 from n9d0g/dev', 'fix: a', 'feat: b'],
		'2.10.0',
	],
	['2.9.0', ['refactor!: new API'], '3.0.0'],
	['2.9.0', ['fix: x\n\nBREAKING CHANGE: gone'], '3.0.0'],
	['0.5.0', ['feat!: new API'], '0.6.0'], // breaking before 1.0: minor
])('%s with %j → %s', (current, messages, next) => {
	expect(nextVersion(current, messages)).toBe(next)
})
