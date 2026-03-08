import type { Interceptor } from '@connectrpc/connect'

// oxlint-disable-next-line no-unused-vars: Used in JSDoc @link only.
import type { createAuthenticator } from './authenticator'

/**
 * Authorization ヘッダーを自動設定する Interceptor を作成する
 *
 * 通常は {@link createAuthenticator} 経由で利用されるため、直接呼び出す必要はない
 *
 * @param getToken - アクセストークンを返す関数
 * @returns リクエストに Bearer トークンを付与する Interceptor
 */
export const createAuthInterceptor = (getToken: () => Promise<string>): Interceptor => {
  return (next) => async (req) => {
    const token = await getToken()
    req.header.set('authorization', `Bearer ${token}`)
    return next(req)
  }
}
