#!/usr/bin/env node
// The version a push to main releases (ADR-0004). The deploy runs it:
//
//   echo '["feat: …", "fix: …"]' | node scripts/next-version.ts 2.9.0
//
// It prints the next version, or nothing when the push releases nothing. The
// messages are the push's commit messages: every commit a dev → main merge
// brings in, merge commits included (they release nothing on their own).
// Ported from nhf-worship.

type Bump = 'major' | 'minor' | 'patch'

const PATCH_TYPES = new Set(['fix', 'perf', 'refactor', 'build'])
const ORDER: Bump[] = ['patch', 'minor', 'major']

/** What one conventional commit asks for, or null (chore, ci, docs, style, test, …). */
export function bumpFor(message: string): Bump | null {
	const [subject = ''] = message.split('\n')
	const head = /^(\w+)(?:\([^)]*\))?(!)?:/.exec(subject)
	if (!head) return null
	if (head[2] || /^BREAKING[ -]CHANGE:/m.test(message)) return 'major'
	if (head[1] === 'feat') return 'minor'
	return PATCH_TYPES.has(head[1]!) ? 'patch' : null
}

/**
 * The version after `current` for these commits: the biggest bump wins. Before
 * 1.0.0 a breaking change bumps the minor version, as release-please did.
 */
export function nextVersion(
	current: string,
	messages: string[]
): string | null {
	const bumps = messages.map(bumpFor).filter((b) => b !== null)
	if (bumps.length === 0) return null
	let bump = ORDER[Math.max(...bumps.map((b) => ORDER.indexOf(b)))]!
	const [major = 0, minor = 0, patch = 0] = current.split('.').map(Number)
	if (bump === 'major' && major === 0) bump = 'minor'
	if (bump === 'major') return `${major + 1}.0.0`
	if (bump === 'minor') return `${major}.${minor + 1}.0`
	return `${major}.${minor}.${patch + 1}`
}

if (import.meta.main) {
	const current = process.argv[2]
	if (!current || !/^\d+\.\d+\.\d+$/.test(current)) {
		console.error(
			'Usage: node scripts/next-version.ts <current x.y.z> < messages.json'
		)
		process.exit(2)
	}
	const chunks: Buffer[] = []
	for await (const chunk of process.stdin) chunks.push(chunk as Buffer)
	const messages = JSON.parse(
		Buffer.concat(chunks).toString('utf8')
	) as string[]
	const next = nextVersion(current, messages)
	if (next) console.log(next)
}
