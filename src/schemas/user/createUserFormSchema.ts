import {z} from "zod";

export const createUserFormSchema = z.object({
    personnelId: z.string().optional(),
    firstName: z.string().min(1, "Jméno je povinné").max(100, "Jméno nesmí být delší než 100 znaků"),
    lastName: z.string().min(1, "Příjmení je povinné").max(100, "Příjmení nesmí být delší než 100 znaků"),
    email: z.string().email("Neplatný formát emailu"),
    phone: z.string().max(30, "Telefon nesmí být delší než 30 znaků").optional(),
    sportId: z.coerce.number().int().positive().optional(),
    editorRoleId: z.coerce.number().int().positive(),
    managedSportIds: z
        .preprocess(
            (v) => (typeof v === "string" ? JSON.parse(v) : v),
            z.array(z.coerce.number().int().positive())
        )
        .optional()
        .default([]),
    isTrainer: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
    trainerCategory: z.string().max(100).optional(),
    isOfficial: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
    officialPosition: z.string().max(100).optional(),
    isActive: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
});

export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;
