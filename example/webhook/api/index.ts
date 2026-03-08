import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'
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

const client = createMixi2Client({ authenticator })

const EVENT_REASON_POST_MENTIONED = 3

const eventHandler = createEventHandler({
  // DM を受け取ったら同じ内容で返信する
  chatMessageReceived: async ({ message }) => {
    if (message !== undefined) {
      await client.sendChatMessage({
        roomId: message.roomId,
        text: message.text,
      })
    }
  },
  // メンションされたら「にゃん」と返信する
  postCreated: async ({ eventReasonList, post }) => {
    if (eventReasonList.includes(EVENT_REASON_POST_MENTIONED) && post !== undefined) {
      await client.createPost({
        text: 'にゃん',
        inReplyToPostId: post.postId,
      })
    }
  },
})

const webhookHandler = createWebhookHandler(
  { signaturePublicKey: env('SIGNATURE_PUBLIC_KEY') },
  eventHandler,
)

export const GET = () => new Response('OK')

export const POST = (request: Request) => webhookHandler(request)
