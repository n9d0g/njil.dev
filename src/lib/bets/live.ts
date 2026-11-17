import { sanityClient } from 'sanity:client'
import { createBets, type UnrecordedBets } from './index'

// The Bets behind the Score before the counter existed. Lower Christina's
// count by one for each of her old wins backfilled in the Studio, so the
// Score stays the same.
const unrecorded: UnrecordedBets = { nathan: 0, christina: 4 }

// Bets sit in the public dataset like Blog posts, read through Sanity's CDN
export const bets = createBets(sanityClient, unrecorded)
