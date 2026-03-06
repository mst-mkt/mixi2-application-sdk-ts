import type { Interceptor } from '@connectrpc/connect'

/** createAuthInterceptor creates an Interceptor that sets the Authorization header. */
export const createAuthInterceptor = (getToken: () => Promise<string>): Interceptor => {
  return (next) => async (req) => {
    const token = await getToken()
    req.header.set('authorization', `Bearer ${token}`)
    return next(req)
  }
}
