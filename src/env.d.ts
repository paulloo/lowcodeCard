/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_CLOUDINARY_CLOUD_NAME: string;
  readonly PUBLIC_CLOUDINARY_PRESET: string;
  readonly CLOUDINARY_API_KEY: string;
  readonly CLOUDINARY_API_SECRET: string;
  readonly AI_API_KEY: string;
  readonly AI_API_BASE_URL: string;
  readonly AI_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}