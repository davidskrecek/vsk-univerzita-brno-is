import { z } from 'zod';

export const partnerOrderFormSchema = z.object({
  partnerId: z.string().min(1, 'Partner je povinný'),
  fullName: z.string().min(1, 'Jméno je povinné').trim(),
  phone: z.string().min(1, 'Telefon je povinný').trim(),
  email: z.string().email('Neplatná e-mailová adresa'),
  details: z.string().min(1, 'Detaily objednávky jsou povinné').trim(),
});

export type PartnerOrderFormData = z.infer<typeof partnerOrderFormSchema>;
