import { Band, User } from '@server/entities'
import { TRPCError } from '@trpc/server'
import { insertUpdateSchema } from '@server/entities/request/update'
import { middleware } from '..'
import { getUserFromToken } from './utils'

export const authMidleware = middleware(async ({ ctx, next }) => {
  if (ctx.authUser) {
    return next({
      ctx: {
        authUser: ctx.authUser,
      },
    })
  }

  if (!ctx.req) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Missing Express request object',
    })
  }

  const token = ctx.req.header('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Unauthenticated. Please log in.',
    })
  }

  const authUser = getUserFromToken(token)

  if (!authUser) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid token.',
    })
  }

  return next({
    ctx: {
      authUser,
    },
  })
})

export const adminMiddleware = authMidleware.unstable_pipe(
  async ({ ctx: { db, authUser }, next }) => {
    const user = await db
      .getRepository(User)
      .findOne({ select: { role: true }, where: { id: authUser.id } })

    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found.',
      })
    }

    if (user.role !== 2) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Unauthorized.',
      })
    }

    return next()
  }
)

export const pendingCheck = middleware(async ({ input, ctx: { db }, next }) => {
  const parsedInput = insertUpdateSchema.parse(input)

  if (parsedInput.entity === 'BAND') {
    const state = await db.getRepository(Band).findOne({
      where: { id: parsedInput.entityId },
      select: { pending: true },
    })

    if (!state) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Error: could not confirm pending state of the band.',
      })
    }

    if (state.pending) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Band is in pending state. Requests cannot be made.',
      })
    }
  }

  return next()
})
