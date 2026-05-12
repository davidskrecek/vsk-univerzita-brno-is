import { z } from "zod";
import { Personnel, Editor, EditorRole, Trainer, Official, AccountInvitation, Sport } from "@prisma/client";

export const UserFormSchema = z.object({
  personnelId: z.coerce.number().optional(),
  firstName: z.string().min(1, "Jméno je povinné"),
  lastName: z.string().min(1, "Příjmení je povinné"),
  email: z.string().email("Neplatný e-mail"),
  phone: z.string().optional(),
  sportId: z.coerce.number().int().positive("Vyberte sport"),
  editorRoleId: z.coerce.number().optional(),
  managedSportIds: z.array(z.coerce.number()).optional().default([]),
  permissions: z.record(z.string(), z.boolean()).optional(),
  isTrainer: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  trainerCategory: z.string().optional(),
  isOfficial: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
  officialPosition: z.string().optional(),
  isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional().default(true),
});

export type UserFormValues = z.infer<typeof UserFormSchema>;

export type UserActionState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
    data?: { personnelId: number };
};

export type FullUser = Personnel & {
    sport: Sport | null;
    editor: (Editor & {
        editorRole: EditorRole;
        managedSports: {
            sportId: number;
            sport: Sport;
        }[];
    }) | null;
    trainer: Trainer | null;
    official: Official | null;
    invitationsReceived: AccountInvitation[];
};

