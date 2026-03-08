import { createGrpcTransport } from '@connectrpc/connect-node'
import { DEFAULT_BASE_URL } from '@mst-mkt/mixi2-application-sdk-ts'
import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'
import type { EventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts/event/webhook'

const env = (name: string): string => {
  const value = process.env[name]?.trim()
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${name}`)
  }
  return value
}

const authenticator = createAuthenticator({
  clientId: env('CLIENT_ID'),
  clientSecret: env('CLIENT_SECRET'),
})

const client = createMixi2Client({
  transport: createGrpcTransport({
    baseUrl: DEFAULT_BASE_URL,
    interceptors: [authenticator.createInterceptor()],
  }),
})

const EVENT_REASON_POST_MENTIONED = 3

const eventHandler: EventHandler = {
  handle: async (event) => {
    // DM を受け取ったら同じ内容で返信する
    if (event.body.case === 'chatMessageReceivedEvent') {
      const message = event.body.value.message
      if (message !== undefined) {
        await client.sendChatMessage({
          roomId: message.roomId,
          text: message.text,
        })
      }
    }

    // メンションされたら「にゃん」と返信する
    if (event.body.case === 'postCreatedEvent') {
      const { eventReasonList, post } = event.body.value
      if (eventReasonList.includes(EVENT_REASON_POST_MENTIONED) && post !== undefined) {
        await client.createPost({
          text: 'にゃん',
          inReplyToPostId: post.postId,
        })
      }
    }
  },
}

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: env('SIGNATURE_PUBLIC_KEY') },
  eventHandler,
)

export const GET = () => new Response('OK')

export const POST = (request: Request) => webhookHandler(request)
