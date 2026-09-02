/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly KIT_API_KEY: string | undefined;
  readonly KIT_FORM_ID: string | undefined;
  readonly PUBLIC_GA_ID: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
