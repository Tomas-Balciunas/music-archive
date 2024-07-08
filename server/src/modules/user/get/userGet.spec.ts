import { fakeUser } from '@server/entities/tests/fakes'
import { createTestDatabase } from '@tests/utils/database'
import { User } from '@server/entities'
import { createCallerFactory } from '@server/trpc'
import { authContext } from '@tests/utils/context'
import router from '..'

const createCaller = createCallerFactory(router)
const db = await createTestDatabase()

it('should get minimal user info', async () => {
  const userFake = await db.getRepository(User).save(fakeUser())

  const { get } = createCaller(authContext({ db }, userFake))

  const user = await get()

  expect(user).toMatchObject({
    username: userFake.username,
    role: userFake.role,
  })
})
