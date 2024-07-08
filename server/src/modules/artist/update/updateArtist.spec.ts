
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { Artist, User } from '@server/entities'
import { fakeArtist, fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)

it('should update an artist', async () => {
    const db = await createTestDatabase()
    const artist = await db.getRepository(Artist).save(fakeArtist())
    const user = await db.getRepository(User).save(fakeUser({role: 2}))

    const { update } = createCaller(authContext({ db }, user))

    const data = {
        id: artist.id,
        name: 'Test',
        birth: null,
        origin: 'Country'
      }

    const updatedArtist = await update(data)

    expect(updatedArtist.name).not.toEqual(artist.name)
})