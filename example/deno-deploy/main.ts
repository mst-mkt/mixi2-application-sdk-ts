import {
  createAuthenticator,
  createMixi2Client,
  createEventHandler,
  createStreamWatcher,
  createWebhookHandler,
} from '@mst-mkt/mixi2-application-sdk-ts'

const getEnv = (name: string): string => {
  const value = Deno.env.get(name)?.trim()
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
      text: 'Hello from Deno Deploy',
    })
  },
  postCreated: async ({ post }) => {
    if (post === undefined) return

    await client.createPost({
      text: 'Hello from Deno Deploy',
      inReplyToPostId: post.postId,
    })
  },
})

if (Deno.env.has('DENO_DEPLOYMENT_ID')) {
  // Deno Deploy: Webhook
  const webhookHandler = createWebhookHandler(
    { signaturePublicKey: getEnv('SIGNATURE_PUBLIC_KEY'), syncHandling: true },
    eventHandler,
  )
  Deno.serve(webhookHandler)
} else {
  // local: gRPC Stream
  const streamWatcher = createStreamWatcher({ authenticator }, eventHandler)
  await streamWatcher.watch()
}
