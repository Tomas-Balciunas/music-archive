import { type BandMinimal  } from '@server/entities/band'
import { publicProcedure } from '@server/trpc'
import { z } from 'zod'
import { findBandsMinimal } from '../services'

export default publicProcedure
.input(z.number().positive().min(1))
.query(async ({ input: page, ctx: { db } }) => {
  const bands: BandMinimal[] = await findBandsMinimal(db, page)

  return bands
})
