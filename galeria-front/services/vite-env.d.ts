/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GALLERY_API_URL?: string;
  readonly VITE_BOT_API_URL?: string;
  readonly VITE_S3_BUCKET_NAME?: string;
  readonly VITE_AWS_REGION?: string;
  readonly VITE_PUBLIC_HOST?: string;
}

