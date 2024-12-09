import { defineUntypedSchema } from 'untyped'

export default defineUntypedSchema({
  /**
   * `future` is for early opting-in to new features that will become default in a future
   * (possibly major) version of the framework.
   */
  future: {
    /**
     * Enable early access to future features or flags.
     *
     * It is currently not configurable but may be in future.
     * @type {4}
     */
    compatibilityVersion: 4,
    /**
     * This enables early access to the experimental multi-app support.
     * @see [Nuxt Issue #21635](https://github.com/nuxt/nuxt/issues/21635)
     */
    multiApp: false,
    /**
     * This enables 'Bundler' module resolution mode for TypeScript, which is the recommended setting
     * for frameworks like Nuxt and Vite.
     *
     * It improves type support when using modern libraries with `exports`.
     *
     * You can set it to false to use the legacy 'Node' mode, which is the default for TypeScript.
     *
     * @see [TypeScript PR implementing `bundler` module resolution](https://github.com/microsoft/TypeScript/pull/51669)
     */
    typescriptBundlerResolution: {
      async $resolve (val, get) {
        // TODO: remove in v3.10
        val = val ?? await (get('experimental') as Promise<Record<string, any>>).then(e => e?.typescriptBundlerResolution)
        if (typeof val === 'boolean') { return val }
        const setting = await get('typescript.tsConfig.compilerOptions.moduleResolution') as string | undefined
        if (setting) {
          return setting.toLowerCase() === 'bundler'
        }
        return true
      },
    },
  },
  /**
   * Some features of Nuxt are available on an opt-in basis, or can be disabled based on your needs.
   */
  features: {
    /**
     * Inline styles when rendering HTML (currently vite only).
     *
     * You can also pass a function that receives the path of a Vue component
     * and returns a boolean indicating whether to inline the styles for that component.
     * @type {boolean | ((id?: string) => boolean)}
     */
    inlineStyles: {
      async $resolve (val, get) {
        // TODO: remove in v3.10
        val = val ?? await (get('experimental') as Promise<Record<string, any>>).then((e: Record<string, any>) => e?.inlineSSRStyles)
        if (val === false || (await get('dev')) || (await get('ssr')) === false || (await get('builder')) === '@nuxt/webpack-builder') {
          return false
        }
        // Enabled by default for vite prod with ssr
        return val ?? true
      },
    },

    /**
     * Stream server logs to the client as you are developing. These logs can
     * be handled in the `dev:ssr-logs` hook.
     *
     * If set to `silent`, the logs will not be printed to the browser console.
     * @type {boolean | 'silent'}
     */
    devLogs: {
      async $resolve (val, get) {
        if (val !== undefined) { return val }
        const [isDev, isTest] = await Promise.all([get('dev'), get('test')])
        return isDev && !isTest
      },
    },

    /**
     * Turn off rendering of Nuxt scripts and JS resource hints.
     * You can also disable scripts more granularly within `routeRules`.
     */
    noScripts: {
      async $resolve (val, get) {
        // TODO: remove in v3.10
        return val ?? await (get('experimental') as Promise<Record<string, any>>).then((e: Record<string, any>) => e?.noScripts) ?? false
      },
    },
  },
  experimental: {
    /**
     * Set to true to generate an async entry point for the Vue bundle (for module federation support).
     */
    asyncEntry: {
      $resolve: val => val ?? false,
    },

    // TODO: Remove when nitro has support for mocking traced dependencies
    // https://github.com/unjs/nitro/issues/1118
    /**
     * Externalize `vue`, `@vue/*` and `vue-router` when building.
     * @see [Nuxt Issue #13632](https://github.com/nuxt/nuxt/issues/13632)
     */
    externalVue: true,

    /**
     * Enable accessing `appConfig` from server routes.
     *
     * @deprecated This option is not recommended.
     */
    serverAppConfig: false,
    /**
     * Emit `app:chunkError` hook when there is an error loading vite/webpack
     * chunks.
     *
     * By default, Nuxt will also perform a reload of the new route
     * when a chunk fails to load when navigating to a new route (`automatic`).
     *
     * Setting `automatic-immediate` will lead Nuxt to perform a reload of the current route
     * right when a chunk fails to load (instead of waiting for navigation).
     *
     * You can disable automatic handling by setting this to `false`, or handle
     * chunk errors manually by setting it to `manual`.
     * @see [Nuxt PR #19038](https://github.com/nuxt/nuxt/pull/19038)
     * @type {false | 'manual' | 'automatic' | 'automatic-immediate'}
     */
    emitRouteChunkError: {
      $resolve: (val) => {
        if (val === true) {
          return 'manual'
        }
        if (val === 'reload') {
          return 'automatic'
        }
        return val ?? 'automatic'
      },
    },

    /**
     * By default the route object returned by the auto-imported `useRoute()` composable
     * is kept in sync with the current page in view in `<NuxtPage>`. This is not true for
     * `vue-router`'s exported `useRoute` or for the default `$route` object available in your
     * Vue templates.
     *
     * By enabling this option a mixin will be injected to keep the `$route` template object
     * in sync with Nuxt's managed `useRoute()`.
     */
    templateRouteInjection: true,

    /**
     * Whether to restore Nuxt app state from `sessionStorage` when reloading the page
     * after a chunk error or manual `reloadNuxtApp()` call.
     *
     * To avoid hydration errors, it will be applied only after the Vue app has been mounted,
     * meaning there may be a flicker on initial load.
     *
     * Consider carefully before enabling this as it can cause unexpected behavior, and
     * consider providing explicit keys to `useState` as auto-generated keys may not match
     * across builds.
     * @type {boolean}
     */
    restoreState: false,

    /** Render JSON payloads with support for revivifying complex types. */
    renderJsonPayloads: true,

    /**
     * Disable vue server renderer endpoint within nitro.
     */
    noVueServer: false,

    /**
     * When this option is enabled (by default) payload of pages that are prerendered are extracted
     * @type {boolean | undefined}
     */
    payloadExtraction: true,

    /**
     * Whether to enable the experimental `<NuxtClientFallback>` component for rendering content on the client
     * if there's an error in SSR.
     */
    clientFallback: false,

    /** Enable cross-origin prefetch using the Speculation Rules API. */
    crossOriginPrefetch: false,

    /**
     * Enable View Transition API integration with client-side router.
     * @see [View Transitions API](https://developer.chrome.com/docs/web-platform/view-transitions)
     * @type {boolean | 'always'}
     */
    viewTransition: false,

    /**
     * Write early hints when using node server.
     * @note nginx does not support 103 Early hints in the current version.
     */
    writeEarlyHints: false,

    /**
     * Experimental component islands support with `<NuxtIsland>` and `.island.vue` files.
     *
     * By default it is set to 'auto', which means it will be enabled only when there are islands,
     * server components or server pages in your app.
     * @type {true | 'auto' | 'local' | 'local+remote' | Partial<{ remoteIsland: boolean, selectiveClient: boolean | 'deep' }> | false}
     */
    componentIslands: {
      $resolve: (val) => {
        if (val === 'local+remote') {
          return { remoteIsland: true }
        }
        if (val === 'local') {
          return true
        }
        return val ?? 'auto'
      },
    },

    /** Resolve `~`, `~~`, `@` and `@@` aliases located within layers with respect to their layer source and root directories. */
    localLayerAliases: true,

    /** Enable the new experimental typed router using [unplugin-vue-router](https://github.com/posva/unplugin-vue-router). */
    typedPages: false,

    /**
     * Use app manifests to respect route rules on client-side.
     */
    appManifest: true,

    /**
     * Set the time interval (in ms) to check for new builds. Disabled when `experimental.appManifest` is `false`.
     *
     * Set to `false` to disable.
     * @type {number | false}
     */
    checkOutdatedBuildInterval: 1000 * 60 * 60,

    /**
     * Set an alternative watcher that will be used as the watching service for Nuxt.
     *
     * Nuxt uses 'chokidar-granular' if your source directory is the same as your root
     * directory . This will ignore top-level directories (like `node_modules` and `.git`)
     * that are excluded from watching.
     *
     * You can set this instead to `parcel` to use `@parcel/watcher`, which may improve
     * performance in large projects or on Windows platforms.
     *
     * You can also set this to `chokidar` to watch all files in your source directory.
     * @see [chokidar](https://github.com/paulmillr/chokidar)
     * @see [@parcel/watcher](https://github.com/parcel-bundler/watcher)
     * @type {'chokidar' | 'parcel' | 'chokidar-granular'}
     */
    watcher: {
      $resolve: async (val, get) => {
        if (val) {
          return val
        }
        const [srcDir, rootDir] = await Promise.all([get('srcDir'), get('rootDir')]) as [string, string]
        if (srcDir === rootDir) {
          return 'chokidar-granular'
        }
        return 'chokidar'
      },
    },

    /**
     * Enable native async context to be accessible for nested composables
     * @see [Nuxt PR #20918](https://github.com/nuxt/nuxt/pull/20918)
     */
    asyncContext: false,

    /**
     * Use new experimental head optimisations:
     *
     * - Add the capo.js head plugin in order to render tags in of the head in a more performant way.
     * - Uses the hash hydration plugin to reduce initial hydration
     *
     * @see [Nuxt Discussion #22632](https://github.com/nuxt/nuxt/discussions/22632)
     */
    headNext: true,

    /**
     * Allow defining `routeRules` directly within your `~/pages` directory using `defineRouteRules`.
     *
     * Rules are converted (based on the path) and applied for server requests. For example, a rule
     * defined in `~/pages/foo/bar.vue` will be applied to `/foo/bar` requests. A rule in `~/pages/foo/[id].vue`
     * will be applied to `/foo/**` requests.
     *
     * For more control, such as if you are using a custom `path` or `alias` set in the page's `definePageMeta`, you
     * should set `routeRules` directly within your `nuxt.config`.
     */
    inlineRouteRules: false,

    /**
     * Allow exposing some route metadata defined in `definePageMeta` at build-time to modules (alias, name, path, redirect).
     *
     * This only works with static or strings/arrays rather than variables or conditional assignment.
     *
     * @see [Nuxt Issues #24770](https://github.com/nuxt/nuxt/issues/24770)
     * @type {boolean | 'after-resolve'}
     */
    scanPageMeta: {
      async $resolve (val, get) {
        return val ?? ((await get('future') as Record<string, unknown>).compatibilityVersion === 4 ? 'after-resolve' : true)
      },
    },

    /**
     * Configure additional keys to extract from the page metadata when using `scanPageMeta`.
     *
     * This allows modules to access additional metadata from the page metadata. It's recommended
     * to augment the NuxtPage types with your keys.
     *
     * @type {string[]}
     */
    extraPageMetaExtractionKeys: [],

    /**
     * Automatically share payload _data_ between pages that are prerendered. This can result in a significant
     * performance improvement when prerendering sites that use `useAsyncData` or `useFetch` and fetch the same
     * data in different pages.
     *
     * It is particularly important when enabling this feature to make sure that any unique key of your data
     * is always resolvable to the same data. For example, if you are using `useAsyncData` to fetch
     * data related to a particular page, you should provide a key that uniquely matches that data. (`useFetch`
     * should do this automatically for you.)
     * @example
     * ```ts
     * // This would be unsafe in a dynamic page (e.g. `[slug].vue`) because the route slug makes a difference
     * // to the data fetched, but Nuxt can't know that because it's not reflected in the key.
     * const route = useRoute()
     * const { data } = await useAsyncData(async () => {
     *   return await $fetch(`/api/my-page/${route.params.slug}`)
     * })
     * // Instead, you should use a key that uniquely identifies the data fetched.
     * const { data } = await useAsyncData(route.params.slug, async () => {
     *   return await $fetch(`/api/my-page/${route.params.slug}`)
     * })
     * ```
     */
    sharedPrerenderData: {
      async $resolve (val, get) {
        return val ?? ((await get('future') as Record<string, unknown>).compatibilityVersion === 4)
      },
    },

    /**
     * Enables CookieStore support to listen for cookie updates (if supported by the browser) and refresh `useCookie` ref values.
     * @see [CookieStore](https://developer.mozilla.org/en-US/docs/Web/API/CookieStore)
     */
    cookieStore: true,

    /**
     * This allows specifying the default options for core Nuxt components and composables.
     *
     * These options will likely be moved elsewhere in the future, such as into `app.config` or into the
     * `app/` directory.
     */
    defaults: {
      /** @type {typeof import('nuxt/app')['NuxtLinkOptions']} */
      nuxtLink: {
        componentName: 'NuxtLink',
        prefetch: true,
        prefetchOn: {
          visibility: true,
        },
      },
      /**
       * Options that apply to `useAsyncData` (and also therefore `useFetch`)
       */
      useAsyncData: {
        deep: false,
      },
      /** @type {Pick<typeof import('ofetch')['FetchOptions'], 'timeout' | 'retry' | 'retryDelay' | 'retryStatusCodes'>} */
      useFetch: {},
    },

    /**
     * Automatically polyfill Node.js imports in the client build using `unenv`.
     * @see [unenv](https://github.com/unjs/unenv)
     *
     * **Note:** To make globals like `Buffer` work in the browser, you need to manually inject them.
     *
     * ```ts
     * import { Buffer } from 'node:buffer'
     *
     * globalThis.Buffer = globalThis.Buffer || Buffer
     * ```
     * @type {boolean}
     */
    clientNodeCompat: false,

    /**
     * Wait for a single animation frame before navigation, which gives an opportunity
     * for the browser to repaint, acknowledging user interaction.
     *
     * It can reduce INP when navigating on prerendered routes.
     */
    navigationRepaint: true,

    /**
     * Cache Nuxt/Nitro build artifacts based on a hash of the configuration and source files.
     *
     * This only works for source files within `srcDir` and `serverDir` for the Vue/Nitro parts of your app.
     */
    buildCache: false,

    /**
     * Ensure that auto-generated Vue component names match the full component name
     * you would use to auto-import the component.
     */
    normalizeComponentNames: {
      $resolve: async (val, get) => {
        return val ?? ((await get('future') as Record<string, unknown>).compatibilityVersion === 4)
      },
    },

    /**
     * Keep showing the spa-loading-template until suspense:resolve
     * @see [Nuxt Issues #21721](https://github.com/nuxt/nuxt/issues/21721)
     * @type {'body' | 'within'}
     */
    spaLoadingTemplateLocation: {
      $resolve: async (val, get) => {
        return val ?? (((await get('future') as Record<string, unknown>).compatibilityVersion === 4) ? 'body' : 'within')
      },
    },

    /**
     * Enable timings for Nuxt application hooks in the performance panel of Chromium-based browsers.
     *
     * @see [the Chrome DevTools extensibility API](https://developer.chrome.com/docs/devtools/performance/extension#tracks)
     */
    browserDevtoolsTiming: {
      $resolve: async (val, get) => val ?? await get('dev'),
    },
  },
})
