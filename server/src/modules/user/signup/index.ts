import bcrypt from 'bcrypt'
import { publicProcedure } from '@server/trpc'
import { User } from '@server/entities'
import config from '@server/config'
import { userSchema } from '@server/entities/user'
import { TRPCError } from '@trpc/server'

// REMOVE ROLE AFTER REVIEW
// REMOVE ROLE AFTER REVIEW
// REMOVE ROLE AFTER REVIEW

export default publicProcedure
  .input(
    userSchema.pick({
      username: true,
      email: true,
      password: true,
      role: true
    })
  )
  .mutation(async ({ input: { username, email, password, role }, ctx: { db } }) => {
    const hash = await bcrypt.hash(password, config.auth.passwordCost)

    try {
      const user = await db.getRepository(User).save({
        username,
        email,
        password: hash,
        role
      })

      return {
        id: user.id,
        username: user.username,
        email: user.email,
      }
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error
      }

      if (error.message.includes('duplicate key')) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'User with this email already exists',
        })
      }

      throw error
    }
  })
