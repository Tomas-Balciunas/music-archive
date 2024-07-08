import { Band, bandSchema } from "@server/entities/band";
import { adminProcedure } from "@server/trpc/procedures";
import { z } from "zod";

export default adminProcedure
.input(bandSchema.pick({id: true}).extend({
    pending: z.boolean()
}))
.mutation(async ({input, ctx: {db}}) => {
    const {id, pending} = input
    const updatedStatus = await db.getRepository(Band).update({id}, {pending})

    return updatedStatus
})