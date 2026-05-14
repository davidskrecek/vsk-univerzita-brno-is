import { z } from 'zod';

export const postFormSchema = z.object({
  id: z.number().optional(),
  sportId: z.number().min(1, 'Sportovní kategorie je povinná'),
  title: z.string().min(1, 'Titulek příspěvku je povinný').trim(),
  content: z.string().min(1, 'Obsah příspěvku je povinný').trim(),
  publishedAt: z.string().optional(),
  links: z
    .array(
      z.object({
        url: z.string(),
        alias: z.string().optional(),
      })
    )
    .default([]),
});

export type PostFormData = z.infer<typeof postFormSchema>;
