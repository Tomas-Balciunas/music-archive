import { RequestCreate, insertCreateSchema } from "@server/entities/request/create";
import { pendingCheckCreate } from "@server/trpc/middlewares";
import { requestProcedure } from "@server/trpc/procedures";

export default requestProcedure
.input(insertCreateSchema)
.use(pendingCheckCreate)
.mutation(async ({input, ctx: {db, authUser}}) => {
    const {entity, info, ...data} = input
    const userId = authUser.id
    const dataJson = JSON.stringify(data)

    const req = await db.getRepository(RequestCreate).save({entity, userId, data: dataJson, info})

    return req
})