import { z } from 'zod';

export type AuthProvider = 'google' | 'apple' | 'github';

export const AuthProviderSchema = z.enum(['google', 'apple', 'github']);

export const AuthUserSchema = z.object({
  id: z.string(),
  provider_id: z.string(),
  provider_type: AuthProviderSchema,
  email: z.string().email(),
  avatar_url: z.string().url().optional(),
  name: z.string().optional(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const AuthStateSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('authenticated'), user: AuthUserSchema }),
  z.object({ status: z.literal('unauthenticated') }),
  z.object({ status: z.literal('loading') }),
]);

export type AuthState = z.infer<typeof AuthStateSchema>;

export const TokenPayloadSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
  expires_at: z.number().optional(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
