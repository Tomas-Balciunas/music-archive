import { artistInsertSchema } from '@server/entities/artist'
import { adminProcedure } from '@server/trpc/procedures'
import { createArtist } from '../services'

export default adminProcedure
  .input(artistInsertSchema)
  .mutation(async ({ input: data, ctx: { db } }) => {
    const createdArtist = await createArtist(db, data)

    return createdArtist
  })
