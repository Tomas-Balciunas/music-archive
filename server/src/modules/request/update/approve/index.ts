import {
  type EntitiesOfUpdate,
  RequestUpdate,
  reqUpdateSchema,
  type UpdateEntityReturns,
} from '@server/entities/request/update'
import { updateAlbum } from '@server/modules/album/services'
import { updateArtist } from '@server/modules/artist/services'
import { updateBand } from '@server/modules/band/services'
import { DataSource } from 'typeorm'
import { updateApprovalSequence } from '@server/trpc/middlewares'
import { adminProcedure } from '@server/trpc/procedures'
import { getRequest } from '../../services'

const entities: {
  [K in EntitiesOfUpdate]: (
    db: DataSource,
    data: any,
    id: number
  ) => Promise<UpdateEntityReturns[K]>
} = {
  ALBUM: updateAlbum,
  ARTIST: updateArtist,
  BAND: updateBand,
}

export default adminProcedure
  .input(reqUpdateSchema.pick({ id: true, entity: true }))
  .use(updateApprovalSequence)
  .mutation(async ({ input, ctx: { db } }) => {
    const { id, entity } = input
    const repo = db.getRepository(RequestUpdate)
    const request = await getRequest<RequestUpdate>(repo, id)

    const data = JSON.parse(request.data)

    const updatedData = await entities[entity](db, data, request.entityId)

    if (updatedData) {
      await db
        .getRepository(RequestUpdate)
        .update({ id }, { status: 'approved' })
    }

    return updatedData
  })
