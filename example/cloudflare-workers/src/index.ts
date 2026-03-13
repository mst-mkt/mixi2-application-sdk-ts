import { createEventHandler, createWebhookHandler } from '@mst-mkt/mixi2-application-sdk-ts'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'GET') return new Response('OK')

    const eventHandler = createEventHandler({
      chatMessageReceived: async ({ message }) => {
        console.log(
          'chatMessageReceived:',
          'Hello from Cloudflare Workers',
          `message-id: ${message?.messageId}`,
          `room-id: ${message?.roomId}`,
        )
      },
      postCreated: async ({ post }) => {
        console.log(
          'postCreated:',
          'Hello from Cloudflare Workers',
          `post-id: ${post?.postId}`,
          `user-id: ${post?.creatorId}`,
        )
      },
    })

    return createWebhookHandler(
      { signaturePublicKey: env.SIGNATURE_PUBLIC_KEY },
      eventHandler,
    )(request)
  },
}
