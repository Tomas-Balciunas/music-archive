import { bandIdSchema, bandUpdateSchema } from '@server/entities/band'
import { adminProcedure } from '@server/trpc/procedures'
import { updateBand } from '../services'

export default adminProcedure
  .input(
    bandUpdateSchema.extend({
      bandId: bandIdSchema.shape.id,
    })
  )
  .mutation(async ({ input, ctx: { db } }) => {
    const { bandId, ...data } = input
    const updatedBand = updateBand(db, data, bandId)

    return updatedBand
  })
