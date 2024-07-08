import { albumInsertSchema } from '@server/entities/album'
import { adminProcedure } from '@server/trpc/procedures'
import { albumExists, createAlbum } from '../services'

export default adminProcedure
  .input(albumInsertSchema)
  .mutation(async ({ input: albumData, ctx: { db } }) => {
    await albumExists(db, albumData)

    const result = await createAlbum(db, albumData)

    return result
  })
