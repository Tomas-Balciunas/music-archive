import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { authContext } from '@tests/utils/context'
import {
  fakeArtist,
  fakeBand,
  fakeRequest,
  fakeUser,
} from '@server/entities/tests/fakes'
import { Artist, Band, RequestCreate, User } from '@server/entities'
import { InsertCreate } from '@server/shared/entities'
import config from '@server/config'
import router from '..'

const createCaller = createCallerFactory(router)

it('should create an artist create request', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())

  const { add } = createCaller(authContext({ db }, user))

  const request: InsertCreate = {
    entity: 'ARTIST',
    info: 'info',
    name: 'John',
    birth: null,
    origin: 'Country',
  }

  const response = await add(request)

  expect(response).toMatchObject({
    entity: request.entity,
    info: request.info,
    data: expect.any(String),
    createdAt: expect.any(Date),
  })
  expect(JSON.parse(response.data)).toMatchObject({
    name: request.name,
    birth: request.birth,
  })
})

it('should create an album create request', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const band = await db.getRepository(Band).save(fakeBand({ pending: false }))
  const artist = await db.getRepository(Artist).save(fakeArtist())

  const { add } = createCaller(authContext({ db }, user))

  const data = {
    title: 'title',
    released: 1999,
    bandId: band.id,
    artists: [{ id: artist.id, name: artist.name }],
    songs: [{ title: 'song', duration: 200 }],
  }

  const request: InsertCreate = {
    entity: 'ALBUM',
    info: 'info',
    ...data,
  }

  const response = await add(request)

  expect(response).toMatchObject({
    entity: request.entity,
    info: request.info,
    data: expect.any(String),
    createdAt: expect.any(Date),
  })
  expect(response.data).toMatchObject(JSON.stringify(data))
})

it('should create an album create request', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const band = await db.getRepository(Band).save(fakeBand())

  const { add } = createCaller(authContext({ db }, user))

  const data = {
    title: 'title',
    released: 1999,
    bandId: band.id,
    artists: [],
    songs: [],
  }

  const request: InsertCreate = {
    entity: 'ALBUM',
    info: 'info',
    ...data,
  }

  expect(add(request)).rejects.toThrow()
})

it('should throw an error when too many pending requests are made', async () => {
  const db = await createTestDatabase()
  const user = await db.getRepository(User).save(fakeUser())
  const requests = []

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= config.maxUserPendingRequests; i++) {
    requests.push(
      fakeRequest({ entity: 'ARTIST', data: 'data', userId: user.id })
    )
  }

  await db.getRepository(RequestCreate).save(requests)

  const { add } = createCaller(authContext({ db }, user))

  const request: InsertCreate = {
    entity: 'ARTIST',
    info: 'info',
    name: 'John',
    birth: null,
    origin: 'Country',
  }

  expect(add(request)).rejects.toThrow()
})
