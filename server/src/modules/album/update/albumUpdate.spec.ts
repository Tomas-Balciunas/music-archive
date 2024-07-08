import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { Album, Band, User } from '@server/entities'
import { fakeAlbum, fakeBand, fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)

it('should update an album', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser({ role: 2 }))
  const band = await db.getRepository(Band).save(fakeBand())
  const album = await db
    .getRepository(Album)
    .save(fakeAlbum({ bandId: band.id }))

  const { update } = createCaller(authContext({ db }, user))

  const updatedAlbum = await update({ ...album, artists: [], songs: [], title: 'test' })

  expect(updatedAlbum.title).not.toEqual(album.title)
})
