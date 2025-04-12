import { z } from "zod";

const envSchema = z.object({
  TALENT_API_KEY: z.string().min(1, "Talent API key is required"),
  NEXT_PUBLIC_ENVIRONMENT: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);

// Type for environment variables
export type Env = z.infer<typeof envSchema>;
