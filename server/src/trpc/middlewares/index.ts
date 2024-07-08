import { Band, User } from '@server/entities'
import { TRPCError } from '@trpc/server'
import {
  RequestUpdate,
  insertUpdateSchema,
  reqUpdateSchema,
} from '@server/entities/request/update'
import {
  RequestCreate,
  insertCreateSchema,
} from '@server/entities/request/create'
import config from '@server/config'
import { Not } from 'typeorm'
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

export const requestMiddleware = authMidleware.unstable_pipe(
  async ({ ctx: { db, authUser }, next }) => {
    const updateRequestCount: number = await db
      .getRepository(RequestUpdate)
      .count({ where: { userId: authUser.id, status: 'pending' } })
    const createRequestCount: number = await db
      .getRepository(RequestCreate)
      .count({ where: { userId: authUser.id, status: 'pending' } })

    const requestCount = updateRequestCount + createRequestCount

    if (requestCount > config.maxUserPendingRequests) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'Reached the limit of allowed pending requests. Please wait until your requests are processed.',
      })
    }

    return next()
  }
)

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

export const updateApprovalSequence = middleware(
  async ({ input, ctx: { db }, next }) => {
    const repository = db.getRepository(RequestUpdate)
    const parsedInput = reqUpdateSchema
      .pick({ id: true, entity: true })
      .parse(input)

    const request = await repository.findOne({
      select: { entity: true, entityId: true, createdAt: true },
      where: { id: parsedInput.id },
    })

    if (!request) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Error: request with id ${parsedInput.id} was not found.`,
      })
    }

    const listOfEntityRequests = await repository.find({
      where: {
        entity: request.entity,
        entityId: request.entityId,
        status: 'pending',
        id: Not(parsedInput.id),
      },
    })

    const isOldest = listOfEntityRequests.every(
      (entry) => new Date(entry.createdAt) > new Date(request.createdAt)
    )

    if (!isOldest) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message:
          'This entity has prior request(s) pending. Please process oldest requests first.',
      })
    }

    return next()
  }
)

export const pendingCheckUpdate = middleware(
  async ({ input, ctx: { db }, next }) => {
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
  }
)

export const pendingCheckCreate = middleware(
  async ({ input, ctx: { db }, next }) => {
    const parsedInput = insertCreateSchema.parse(input)

    if (parsedInput.entity === 'ALBUM') {
      const state = await db.getRepository(Band).findOne({
        where: { id: parsedInput.bandId },
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
  }
)
