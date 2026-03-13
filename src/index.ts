/**
 * mixi2 Application SDK for TypeScript
 *
 * 認証・APIクライアント・イベントハンドリングを提供する
 *
 * @module
 */

// auth
export { createAuthenticator, createAuthInterceptor } from './auth'
export type { AuthConfig, Authenticator } from './auth'

// client
export { createMixi2Client } from './client'
export type { ClientConfig, Mixi2Client } from './client'

// constants
export { DEFAULT_BASE_URL, DEFAULT_TOKEN_URL, DEFAULT_STREAM_BASE_URL } from './constants'

// transport
export type { TransportFactory } from './transport'

// event
export type { EventHandler, OnErrorHandler } from './event/types'
export { createEventHandler } from './event/handler'
export type { EventHandlers } from './event/handler'

// event/webhook
export { createWebhookHandler } from './event/webhook/handler'
export type { WebhookHandlerConfig } from './event/webhook/handler'

// event/stream
export { createStreamWatcher } from './event/stream/watcher'
export type { StreamWatcher, StreamWatcherConfig } from './event/stream/watcher'

// gen: model types
export type {
  PostCreatedEvent,
  ChatMessageReceivedEvent,
} from './gen/social/mixi/application/model/v1/event_pb'
export type {
  Post,
  PostMedia,
  PostMediaImage,
  PostMediaVideo,
  PostMask,
  PostStamp,
} from './gen/social/mixi/application/model/v1/post_pb'
export type { User, UserAvatar } from './gen/social/mixi/application/model/v1/user_pb'
export type { ChatMessage } from './gen/social/mixi/application/model/v1/message_pb'
export type {
  Media,
  MediaImage,
  MediaVideo,
  MediaStamp,
} from './gen/social/mixi/application/model/v1/media_pb'
export type {
  OfficialStampSet,
  OfficialStamp,
} from './gen/social/mixi/application/model/v1/stamp_pb'

// gen: const enums
export { EventType, EventReason } from './gen/social/mixi/application/const/v1/event_type_pb'
export { LanguageCode } from './gen/social/mixi/application/const/v1/language_code_pb'
export { MediaType } from './gen/social/mixi/application/const/v1/media_type_pb'
export { PostAccessLevel } from './gen/social/mixi/application/const/v1/post_access_level_pb'
export { PostMaskType } from './gen/social/mixi/application/const/v1/post_mask_type_pb'
export { PostMediaType } from './gen/social/mixi/application/const/v1/post_media_type_pb'
export { PostPublishingType } from './gen/social/mixi/application/const/v1/post_publishing_type_pb'
export { PostVisibility } from './gen/social/mixi/application/const/v1/post_visibility_pb'
export { StampSetType } from './gen/social/mixi/application/const/v1/stamp_set_type_pb'
export { UserAccessLevel } from './gen/social/mixi/application/const/v1/user_access_level_pb'
export { UserVisibility } from './gen/social/mixi/application/const/v1/user_visibility_pb'
