import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { Band } from '@server/entities'
import { fakeBand } from '@server/entities/tests/fakes'
import { authContext } from '@tests/utils/context'
import router from '..'

const createCaller = createCallerFactory(router)

it('should count pages for all bands', async () => {
  const db = await createTestDatabase()
  await db
    .getRepository(Band)
    .save([
      fakeBand({ pending: false }),
    ])

  const { count } = createCaller(authContext({ db }))
  const result = await count()

  expect(result).toBe(1)
})
