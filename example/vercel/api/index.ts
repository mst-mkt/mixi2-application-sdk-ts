import { createAuthenticator } from '@mst-mkt/mixi2-application-sdk-ts/auth'
import { createMixi2Client } from '@mst-mkt/mixi2-application-sdk-ts/client'
import { createEventHandler } from '@mst-mkt/mixi2-application-sdk-ts/event'
import { createStreamWatcher } from '@mst-mkt/mixi2-application-sdk-ts/event/stream'
import { createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts/event/webhook'

const getEnv = (name: string): string => {
  const value = process.env[name]?.trim()
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${name}`)
  }
  return value
}

const authenticator = createAuthenticator({
  clientId: getEnv('CLIENT_ID'),
  clientSecret: getEnv('CLIENT_SECRET'),
})

const client = createMixi2Client({ authenticator })

const eventHandler = createEventHandler({
  chatMessageReceived: async ({ message }) => {
    if (message === undefined) return

    await client.sendChatMessage({
      roomId: message.roomId,
      text: 'Hello from Vercel',
    })
  },
  postCreated: async ({ post }) => {
    if (post === undefined) return

    await client.createPost({
      text: 'Hello from Vercel',
      inReplyToPostId: post.postId,
    })
  },
})

// local: gRPC Stream
if (!process.env.VERCEL) {
  const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
  await streamWatcher.watch()
}

// Vercel: Webhook
const webhookHandler = createWebhookHandler(
  { signaturePublicKey: getEnv('SIGNATURE_PUBLIC_KEY'), syncHandling: true },
  eventHandler,
)

export const GET = () => new Response('OK')
export const POST = (request: Request) => webhookHandler(request)
