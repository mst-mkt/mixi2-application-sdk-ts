import type { Interceptor } from '@connectrpc/connect'

/** Authorization ヘッダーを自動設定する Interceptor を作成する */
export const createAuthInterceptor = (getToken: () => Promise<string>): Interceptor => {
  return (next) => async (req) => {
    const token = await getToken()
    req.header.set('authorization', `Bearer ${token}`)
    return next(req)
  }
}
