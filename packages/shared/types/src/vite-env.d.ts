/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV?: string;
  readonly MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
