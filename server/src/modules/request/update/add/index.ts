import {
  RequestUpdate,
  insertUpdateSchema,
} from '@server/entities/request/update'
import { requestProcedure } from '@server/trpc/procedures'
import { TRPCError } from '@trpc/server'
import { pendingCheckUpdate } from '@server/trpc/middlewares'
import {
  areChanges,
  entityGet,
  findChanges,
  relationsSeparator,
} from '../../services'

export default requestProcedure
  .input(insertUpdateSchema)
  .use(pendingCheckUpdate)
  .mutation(async ({ input, ctx: { db, authUser } }) => {
    const { entity, entityId, info, ...data } = input
    const userId = authUser.id

    const { keys, relations } = relationsSeparator(data)

    const original = await entityGet(entity, entityId, db)

    const changes = findChanges(data, original, keys).changes()

    if (!areChanges(changes, relations)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'No changes detected.',
      })
    }

    const changesJson = JSON.stringify({ ...changes, ...relations })

    const req = await db
      .getRepository(RequestUpdate)
      .save({ entity, entityId, userId, data: changesJson, info })

    return req
  })
