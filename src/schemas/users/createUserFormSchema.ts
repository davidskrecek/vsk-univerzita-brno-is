import { z } from 'zod';

export const createUserFormSchema = z.object({
  fullName: z.string().min(1, 'Jméno je povinné').trim(),
  email: z.string().email('Neplatná e-mailová adresa'),
  phone: z.string().min(1, 'Telefon je povinný').trim(),
  sportId: z.string().optional(),
  editorType: z.enum(['none', 'editor', 'admin']).default('none') as z.ZodType<'none' | 'editor' | 'admin'>,
  permissions: z.object({
    posts: z.string().default('write'),
    events: z.string().default('write'),
  }).optional(),
  trainerCategory: z.string().optional(),
});

export type CreateUserFormData = z.infer<typeof createUserFormSchema>;

