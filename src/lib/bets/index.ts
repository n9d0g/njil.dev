import { defineQuery } from 'groq'
import type { BetsQueryResult } from '@app-types/sanity.types'

export type Player = 'nathan' | 'christina'
export type Outcome = 'open' | Player | 'void'

export interface Bet {
	id: string
	about: string
	sides: Record<Player, string>
	madeOn: string
	// Open Bets only, when known: roughly when it will be decided
	settlesOn?: string
	outcome: Outcome
	// Settled Bets only
	settledOn?: string
}

// Bets settled before the counter existed: only who won how many is kept
export type UnrecordedBets = Record<Player, number>

export interface BetBoard {
	// Nathan's wins minus Christina's, Unrecorded Bets included
	score: number
	leader: string
	open: Bet[]
	settled: Bet[]
	unrecorded: UnrecordedBets
}

export interface BetsClient {
	fetch<T>(query: string, params?: Record<string, unknown>): Promise<T>
}

const betsQuery = defineQuery(`*[_type == "bet"]{
	_id,
	about,
	nathanSide,
	christinaSide,
	madeOn,
	settlesOn,
	outcome,
	settledOn
}`)

// Sanity dates are plain YYYY-MM-DD, so they're read and shown in UTC
const day = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	day: 'numeric',
	year: 'numeric',
	timeZone: 'UTC',
})
const month = new Intl.DateTimeFormat('en-US', {
	month: 'short',
	year: 'numeric',
	timeZone: 'UTC',
})
const display = (format: Intl.DateTimeFormat, date: string) =>
	format.format(new Date(`${date}T00:00:00Z`))

const names: Record<Player, string> = {
	nathan: 'Nathan',
	christina: 'Christina',
}

export const scoreLabel = (score: number) =>
	score === 0
		? 'All square'
		: `${names[score > 0 ? 'nathan' : 'christina']} leads by ${Math.abs(score)}`

// The Score with its sign: a real minus, and a plus when Nathan's ahead
export const signedScore = (score: number) =>
	score > 0 ? `+${score}` : score < 0 ? `−${-score}` : '0'

type Row = BetsQueryResult[number]

const isOpen = (row: Row) => (row.outcome ?? 'open') === 'open'

// ISO dates sort as strings; a missing date sorts last
const byDate =
	(field: 'settlesOn' | 'settledOn', direction: 1 | -1) => (a: Row, b: Row) => {
		const x = a[field]
		const y = b[field]
		if (x === y) return (b.madeOn ?? '').localeCompare(a.madeOn ?? '')
		if (!x) return 1
		if (!y) return -1
		return x.localeCompare(y) * direction
	}

export function createBets(client: BetsClient, unrecorded: UnrecordedBets) {
	const toBet = (row: Row): Bet => ({
		id: row._id,
		about: row.about ?? 'Untitled',
		sides: {
			nathan: row.nathanSide ?? '',
			christina: row.christinaSide ?? '',
		},
		madeOn: row.madeOn ? display(day, row.madeOn) : '',
		settlesOn:
			isOpen(row) && row.settlesOn ? display(month, row.settlesOn) : undefined,
		outcome: row.outcome ?? 'open',
		settledOn:
			!isOpen(row) && row.settledOn ? display(day, row.settledOn) : undefined,
	})

	async function getBoard(): Promise<BetBoard> {
		const rows = await client.fetch<BetsQueryResult>(betsQuery)

		const wins = (player: Player) =>
			unrecorded[player] + rows.filter((r) => r.outcome === player).length
		const score = wins('nathan') - wins('christina')

		return {
			score,
			leader: scoreLabel(score),
			open: rows.filter(isOpen).toSorted(byDate('settlesOn', 1)).map(toBet),
			settled: rows
				.filter((r) => !isOpen(r))
				.toSorted(byDate('settledOn', -1))
				.map(toBet),
			unrecorded,
		}
	}

	return { getBoard }
}
