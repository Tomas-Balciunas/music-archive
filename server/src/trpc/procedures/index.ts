import { publicProcedure } from '..'
import { authMidleware, adminMiddleware, requestMiddleware } from '../middlewares'

export const authProcedure = publicProcedure.use(authMidleware)
export const adminProcedure = authProcedure.use(adminMiddleware)

export const requestProcedure = authProcedure.use(requestMiddleware)

