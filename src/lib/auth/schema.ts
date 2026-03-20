import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().trim().min(1, 'USERNAME_REQUIRED'),
  password: z.string().min(1, 'PASSWORD_REQUIRED'),
  confirmPassword: z.string().min(1, 'PASSWORD_REQUIRED'),
});
