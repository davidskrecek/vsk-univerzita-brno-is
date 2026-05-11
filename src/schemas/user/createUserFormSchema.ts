import {z} from "zod";

export const createUserFormSchema = z
    .object({
        personnelId: z.string().optional(),

        firstName: z.string().min(1, "Jméno je povinné").max(100, "Jméno nesmí být delší než 100 znaků"),
        lastName: z.string().min(1, "Příjmení je povinné").max(100, "Příjmení nesmí být delší než 100 znaků"),
        email: z.string().min(1, "Email je povinný").email("Neplatný formát emailu"),
        phone: z.string().max(30, "Telefon nesmí být delší než 30 znaků").optional(),
        sportId: z.coerce.number().int().positive("Sport je povinný"),
        editorRoleId: z.coerce.number().int().positive("Role editora je povinná"),

        managedSportIds: z.preprocess(
                (v) => (typeof v === "string" ? JSON.parse(v) : v),
                z.array(z.coerce.number().int().positive())
            )
            .optional()
            .default([]),

        isTrainer: z.preprocess(
            (v) => v === "true" || v === true,
            z.boolean()
        ).optional(),

        trainerCategory: z.string().max(100, "Kategorie trenéra nesmí být delší než 100 znaků").optional(),

        isOfficial: z.preprocess(
            (v) => v === "true" || v === true,
            z.boolean()
        ).optional(),

        officialPosition: z.string().max(100, "Pozice nesmí být delší než 100 znaků").optional(),

        isActive: z.preprocess(
            (v) => v === "true" || v === true,
            z.boolean()
        ).optional(),
    })
    .superRefine((data, ctx) => {
        if (data.isTrainer && !data.trainerCategory?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["trainerCategory"],
                message: "Kategorie trenéra je povinná",
            });
        }

        if (data.isOfficial && !data.officialPosition?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["officialPosition"],
                message: "Pozice je povinná",
            });
        }
    });

export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;

