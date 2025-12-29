/// <reference types="next" />
/// <reference types="next/image-types/global" />

declare namespace NodeJS {
  interface ProcessEnv {
    OPENAI_API_KEY: string;
    NEXT_PUBLIC_APP_URL?: string;
  }
}
