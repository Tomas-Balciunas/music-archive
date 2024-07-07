import { authProcedure } from '@server/trpc/procedures'
import { albumSchema, albumUpdateSchema } from '@server/entities/album'
import { updateAlbum } from '../services'

export default authProcedure
  .input(albumUpdateSchema.extend({ id: albumSchema.shape.id }))
  .mutation(async ({ input, ctx: { db } }) => {
    const { id, ...data } = input

    const updatedAlbum = updateAlbum(db, data, id)

    return updatedAlbum
  })
