import { z } from 'zod';

const linkSchema = z.object({
  url: z.string(),
  alias: z.string().optional(),
});

export const eventFormSchema = z.object({
  id: z.number().optional(),
  sportId: z.number().min(1, 'Prosím vyberte sportovní odvětví'),
  title: z.string().min(1, 'Název akce je povinný').trim(),
  description: z.string().min(1, 'Podrobnosti akce jsou povinné').trim(),
  startDate: z.string().min(1, 'Datum konání je povinné'),
  startTime: z.string().min(1, 'Čas zahájení je povinný'),
  location: z.string().optional(),
  links: z.array(linkSchema).default([]),
});

export type EventFormData = z.infer<typeof eventFormSchema>;
