import bcrypt from 'bcrypt'
import { createCallerFactory } from '@server/trpc'
import { createTestDatabase } from '@tests/utils/database'
import { User } from '@server/entities'
import { fakeUser } from '@server/entities/tests/fakes'
import router from '..'

const createCaller = createCallerFactory(router)
const PW = 'Password.123!'
const PW2 = 'Password.1234!'
const EMAIL = 'mail@mail.com'
const EMAIL2 = 'mail@mail.lt'

it('should return access token', async () => {
  const db = await createTestDatabase()
  const hash = await bcrypt.hash(PW, 6)
  await db.getRepository(User).save(fakeUser({ password: hash, email: EMAIL }))

  const credentials = {
    email: EMAIL,
    password: PW,
  }

  const { login } = createCaller({ db })

  const { accessToken } = await login(credentials)

  expect(accessToken).toEqual(expect.any(String))
})

it('should throw an error when email is not found', async () => {
  const db = await createTestDatabase()
  const hash = await bcrypt.hash(PW, 6)
  await db.getRepository(User).save(fakeUser({ password: hash, email: EMAIL }))

  const credentials = {
    email: EMAIL2,
    password: PW,
  }

  const { login } = createCaller({ db })

  expect(login(credentials)).rejects.toThrow()
})

it('should throw an error when password is incorrect', async () => {
  const db = await createTestDatabase()
  const hash = await bcrypt.hash(PW, 6)
  await db.getRepository(User).save(fakeUser({ password: hash, email: EMAIL }))

  const credentials = {
    email: EMAIL,
    password: PW2,
  }

  const { login } = createCaller({ db })

  expect(login(credentials)).rejects.toThrow()
})