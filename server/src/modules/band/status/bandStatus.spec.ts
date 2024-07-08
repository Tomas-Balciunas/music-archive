import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { Band, User } from '@server/entities'
import { fakeBand, fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)

it('should approve band', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 2 }))
  const band = await db.getRepository(Band).save(fakeBand())

  const { status } = createCaller(authContext({ db }, user))
  await status({ id: band.id, pending: false })

  const approvedBand = await db
    .getRepository(Band)
    .findOne({ where: { id: band.id } })

  expect(approvedBand?.pending).toBe(false)
})
