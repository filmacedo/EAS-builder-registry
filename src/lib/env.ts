import { z } from "zod";

const envSchema = z.object({
  // Server-side only variables
  TALENT_API_KEY: z.string().min(1, "Talent API key is required"),

  // Client-side variables
  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
});

// Only parse environment variables on the server side
export const env =
  typeof window === "undefined" ? envSchema.parse(process.env) : null;

// Type for environment variables
export type Env = z.infer<typeof envSchema>;
