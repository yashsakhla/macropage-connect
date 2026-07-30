/// <reference types="vite/client" />

declare module '*.mp4' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_SOCKET_URL: string
  // add other env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
