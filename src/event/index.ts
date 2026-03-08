/**
 * Event handling for mixi2 Application API notifications.
 *
 * Provides types and utilities for handling webhook and stream events.
 *
 * @module
 */

export type { EventHandler, OnErrorHandler } from './types'
export { createEventHandler } from './handler'
export type { EventHandlers } from './handler'
