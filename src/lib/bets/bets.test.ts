import { describe, expect, test } from 'vite-plus/test'
import { createBets, scoreLabel, signedScore } from './index'

const row = (id: string, overrides: object = {}) => ({
	_id: id,
	about: `bet ${id}`,
	nathanSide: 'yes',
	christinaSide: 'no',
	madeOn: '2026-01-10',
	settlesOn: null,
	outcome: 'open',
	settledOn: null,
	...overrides,
})

const won = (id: string, by: string, settledOn = '2026-02-01') =>
	row(id, { outcome: by, settledOn })

// Stands in for Sanity: every query gets the same canned rows
const boardOf = (rows: unknown[], unrecorded = { nathan: 0, christina: 0 }) =>
	createBets({ fetch: async <T>() => rows as T }, unrecorded).getBoard()

describe('Score', () => {
	test('is Nathan’s wins minus Christina’s', async () => {
		const board = await boardOf([
			won('1', 'nathan'),
			won('2', 'christina'),
			won('3', 'christina'),
		])

		expect(board.score).toBe(-1)
		expect(board.leader).toBe('Christina leads by 1')
	})

	test('counts Unrecorded Bets', async () => {
		const board = await boardOf([won('1', 'nathan')], {
			nathan: 0,
			christina: 4,
		})

		expect(board.score).toBe(-3)
	})

	test('ignores Open and Void Bets', async () => {
		const board = await boardOf([row('1'), won('2', 'void')])

		expect(board.score).toBe(0)
		expect(board.leader).toBe('All square')
	})
})

describe('scoreLabel', () => {
	test('names whoever is ahead', () => {
		expect(scoreLabel(2)).toBe('Nathan leads by 2')
		expect(scoreLabel(-4)).toBe('Christina leads by 4')
		expect(scoreLabel(0)).toBe('All square')
	})
})

describe('signedScore', () => {
	test('shows the sign, with a real minus', () => {
		expect(signedScore(-4)).toBe('−4')
		expect(signedScore(3)).toBe('+3')
		expect(signedScore(0)).toBe('0')
	})
})

describe('Open Bets', () => {
	test('are listed soonest to settle first, undated last', async () => {
		const { open } = await boardOf([
			row('undated'),
			row('2028', { settlesOn: '2028-06-01' }),
			row('2027', { settlesOn: '2027-01-01' }),
		])

		expect(open.map((b) => b.id)).toEqual(['2027', '2028', 'undated'])
	})

	test('show roughly when they settle, as a month', async () => {
		const [bet] = (await boardOf([row('1', { settlesOn: '2028-06-01' })])).open

		expect(bet).toEqual({
			id: '1',
			about: 'bet 1',
			sides: { nathan: 'yes', christina: 'no' },
			madeOn: 'Jan 10, 2026',
			settlesOn: 'Jun 2028',
			outcome: 'open',
			settledOn: undefined,
		})
	})
})

describe('Settled Bets', () => {
	test('are listed most recently settled first, without a settles-on date', async () => {
		const { settled } = await boardOf([
			won('old', 'nathan', '2025-03-01'),
			won('new', 'void', '2026-03-01'),
			row('open'),
		])

		expect(settled.map((b) => [b.id, b.settledOn, b.settlesOn])).toEqual([
			['new', 'Mar 1, 2026', undefined],
			['old', 'Mar 1, 2025', undefined],
		])
	})
})
