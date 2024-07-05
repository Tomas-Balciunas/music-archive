import config from '@server/config'
import { Band } from '@server/entities'
import { publicProcedure } from '@server/trpc'

export default publicProcedure.query(async ({ ctx: { db } }) => {
  const result = await db
    .getRepository(Band)
    .count({ where: { pending: false } })

    const limit = config.pagination.bands
    const pages = Math.ceil(result / limit)

    return pages
})
