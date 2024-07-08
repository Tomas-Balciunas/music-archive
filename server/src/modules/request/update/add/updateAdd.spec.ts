import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import { fakeArtist, fakeBand, fakeUser } from '@server/entities/tests/fakes'
import { Artist, Band, User } from '@server/entities'
import { InsertUpdate } from '@server/shared/entities'
import router from '..'

const createCaller = createCallerFactory(router)

it('should create an update request', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const artist = await db.getRepository(Artist).save(fakeArtist())

  const { add } = createCaller(authContext({ db }, user))

  const request: InsertUpdate = {
    entityId: artist.id,
    entity: 'ARTIST',
    info: 'info',
    name: 'John',
    birth: null,
    origin: 'Country'
  }

  const response = await add(request)

  expect(response).toMatchObject({
    entityId: request.entityId,
    entity: request.entity,
    info: request.info,
    data: expect.any(String),
    createdAt: expect.any(Date)
  })
  expect(JSON.parse(response.data)).toMatchObject({name: request.name, birth: request.birth})
})

it('should throw error when no changes are made', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const artist = await db.getRepository(Artist).save(fakeArtist())

  const { add } = createCaller(authContext({ db }, user))

  const request: InsertUpdate = {
    entityId: artist.id,
    entity: 'ARTIST',
    info: 'info',
    name: artist.name,
    birth: artist.birth,
    origin: artist.origin
  }

  expect(add(request)).rejects.toThrow()
})

it('should throw error when making a request for pending band', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const band = await db.getRepository(Band).save(fakeBand())

  const { add } = createCaller(authContext({ db }, user))

  const request: InsertUpdate = {
    entityId: band.id,
    entity: 'BAND',
    info: 'info',
    ...band,
    artists: [],
    origin: 'test'
  }

  expect(add(request)).rejects.toThrow()
})