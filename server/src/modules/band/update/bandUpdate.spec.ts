
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { Band, User } from '@server/entities'
import { fakeBand, fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)

it('should update a band', async () => {
    const db = await createTestDatabase()
    const user = await db.getRepository(User).save(fakeUser({role: 2}))
    const band = await db.getRepository(Band).save(fakeBand())

    const { update } = createCaller(authContext({ db }, user))

    const updatedBand = await update({...band, artists: [], bandId: band.id, name: 'Test'})

    expect(updatedBand.name).not.toEqual(band.name)
})