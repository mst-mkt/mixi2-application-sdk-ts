import { defineConfig } from 'vite-plus'

export default defineConfig({
  run: {
    tasks: {
      generate: {
        command: 'buf generate',
        cache: false,
      },
      build: {
        command: 'vp pack',
      },
      dev: {
        command: 'vp pack --watch',
      },
      check: {
        command: 'vp check',
      },
      fix: {
        command: 'vp check --fix',
      },
      test: {
        command: 'vp test run',
      },
      'test:watch': {
        command: 'vp test',
      },
      'test:ci': {
        command: 'vp test run --reporter=default --reporter=github-actions',
      },
      release: {
        command: 'changeset publish',
        dependsOn: ['build'],
        cache: false,
      },
      version: {
        command: 'changeset version && node ./scripts/sync-jsr-version.ts',
        cache: false,
      },
    },
  },
  staged: {
    '*': 'vp check --fix',
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
  pack: {
    entry: ['./src/index.ts'],
    format: ['esm'],
    dts: true,
    clean: true,
    platform: 'neutral',
    sourcemap: true,
    unbundle: true,
  },
  fmt: {
    ignorePatterns: [
      'dist/**',
      'src/gen/**',
      '.changeset/**',
      'CHANGELOG.md',
      'worker-configuration.d.ts',
    ],
    semi: false,
    singleQuote: true,
    sortImports: {},
    sortPackageJson: {
      sortScripts: false,
    },
  },
  lint: {
    plugins: ['import', 'vitest'],
    options: {
      typeAware: true,
      typeCheck: true,
    },
    ignorePatterns: ['dist/**', 'src/gen/**', 'example/**'],
    rules: {
      'no-unused-vars': 'warn',
      'typescript/consistent-type-imports': 'warn',
    },
  },
})
