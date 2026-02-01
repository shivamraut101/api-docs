import { z } from "zod";

// Environment schema for validation
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  API_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
  
  // Primexmeta API credentials
  PRIMEXMETA_API_KEY: z.string().optional(),
  PRIMEXMETA_API_SECRET: z.string().optional(),
  
  // App URL
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate and get environment variables
export function getEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", result.error.format());
    throw new Error("Invalid environment variables");
  }

  return result.data;
}

// Server-only environment access
export const env = typeof window === "undefined" ? getEnv() : ({} as Env);
