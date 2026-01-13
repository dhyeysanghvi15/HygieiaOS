type ExtendableEventLike = { waitUntil: (p: Promise<unknown>) => void }
type FetchEventLike = ExtendableEventLike & { request: Request; respondWith: (p: Promise<Response>) => void }

declare const self: typeof globalThis & {
  // Workbox injectManifest requires this exact identifier.
  __WB_MANIFEST: Array<{ url: string; revision?: string }>
}

const sw = self as unknown as typeof globalThis & {
  skipWaiting: () => Promise<void>
  clients: { claim: () => Promise<void> }
  registration: { scope: string }
  location: { origin: string }
}

const PRECACHE = 'wellnessos-precache-v1'
const RUNTIME = 'wellnessos-runtime-v1'

sw.addEventListener('install', (event: Event) => {
  const e = event as unknown as ExtendableEventLike
  e.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE)
      const urls = self.__WB_MANIFEST.map((e: { url: string }) => e.url)
      await cache.addAll(urls)
      await sw.skipWaiting()
    })(),
  )
})

sw.addEventListener('activate', (event: Event) => {
  const e = event as unknown as ExtendableEventLike
  e.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => ![PRECACHE, RUNTIME].includes(k)).map((k) => caches.delete(k)))
      await sw.clients.claim()
    })(),
  )
})

sw.addEventListener('fetch', (event: Event) => {
  const e = event as unknown as FetchEventLike
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET') return
  if (url.origin !== sw.location.origin) return

  e.respondWith(
    (async () => {
      const precache = await caches.open(PRECACHE)
      const cached = await precache.match(req)
      if (cached) return cached

      const runtime = await caches.open(RUNTIME)
      const runtimeHit = await runtime.match(req)
      if (runtimeHit) return runtimeHit

      try {
        const res = await fetch(req)
        if (res.ok && (url.pathname.startsWith('/knowledge/') || url.pathname.startsWith('/assets/'))) {
          runtime.put(req, res.clone())
        }
        return res
      } catch {
        // Offline fallback for navigation
        if (req.mode === 'navigate') {
          const scopePath = new URL(sw.registration.scope).pathname
          const indexUrl = (scopePath.endsWith('/') ? scopePath : `${scopePath}/`) + 'index.html'
          const shell = await precache.match(indexUrl)
          if (shell) return shell
        }
        return new Response('Offline', { status: 503 })
      }
    })(),
  )
})
