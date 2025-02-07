import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    AUTH_DISCORD_ID: z.string(),
    AUTH_DISCORD_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),

    WECHAT_APP_ID:z.string(),
    WECHAT_MCH_ID:z.string(),
    WECHAT_API_KEY:z.string(),

    GMAIL_USER:z.string(),
    GMAIL_APP_PASSWORD:z.string(),

    REDIS_URL:z.string(),
    REDIS_TOKEN:z.string(),
    
    // WECHAT_CERT_PATH:z.string(),
    // WECHAT_KEY_PATH:z.string(),

  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),


  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    AUTH_DISCORD_ID: process.env.AUTH_DISCORD_ID,
    AUTH_DISCORD_SECRET: process.env.AUTH_DISCORD_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    WECHAT_APP_ID:process.env.WECHAT_APP_ID,
    WECHAT_MCH_ID:process.env.WECHAT_MCH_ID,
    WECHAT_API_KEY:process.env.WECHAT_API_KEY,

    GMAIL_USER:process.env.GMAIL_USER,
    GMAIL_APP_PASSWORD:process.env.GMAIL_APP_PASSWORD,

    REDIS_URL:process.env.REDIS_URL,
    REDIS_TOKEN:process.env.REDIS_TOKEN,

    // WECHAT_CERT_PATH:process.env.WECHAT_CERT_PATH,
    // WECHAT_KEY_PATH:process.env.WECHAT_KEY_PATH,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
