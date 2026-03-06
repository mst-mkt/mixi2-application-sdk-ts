import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    './src/index.ts',
    './src/auth/index.ts',
    './src/client/index.ts',
    './src/event/index.ts',
    './src/event/webhook/index.ts',
    './src/event/stream/index.ts',
  ],
  format: ['esm'],
  dts: true,
  clean: true,
  platform: 'neutral',
  sourcemap: true,
  unbundle: true,
})
