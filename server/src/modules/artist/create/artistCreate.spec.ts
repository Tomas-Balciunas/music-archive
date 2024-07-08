import { authContext } from '@tests/utils/context'
import { createTestDatabase } from '@tests/utils/database'
import { createCallerFactory } from '@server/trpc'
import { Band, User } from '@server/entities'
import { fakeBand, fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)

it('should create an artist with album link', async () => {
  const db = await createTestDatabase()
  const band = await db.getRepository(Band).save(fakeBand())
  const user = await db.getRepository(User).save(fakeUser({role: 2}))

  const { create } = createCaller(authContext({ db }, user))

  const artistInsert = {
    name: 'Artist Name',
    birth: null,
    bandId: band.id,
    origin: 'Country'
  }

  const artist = await create(artistInsert)

  expect(artist).toMatchObject({
    id: expect.any(Number),
    name: artistInsert.name,
    birth: null
  })
})