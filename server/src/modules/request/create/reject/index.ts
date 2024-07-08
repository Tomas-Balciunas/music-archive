import { RequestCreate, reqCreateSchema } from '@server/entities/request/create'
import { adminProcedure } from '@server/trpc/procedures'

export default adminProcedure
  .input(reqCreateSchema.shape.id)
  .mutation(async ({ input: rId, ctx: { db } }) => {
    const rejectedRequest = await db
      .getRepository(RequestCreate)
      .update({ id: rId }, { status: 'rejected' })

    return rejectedRequest
  })
