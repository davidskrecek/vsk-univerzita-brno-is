import {z} from "zod";

export const createUserFormSchema = z.object({
    firstName: z.string().min(1, "Jméno nesmí být prázdné").max(100, "Jméno nesmí být delší než 100 znaků"),
    lastName: z.string().min(1, "Přijmení nesmí být prázdné").max(100, "Příjmení nesmí být delší než 100 znaků"),
    email: z.string().email("Email nesmí být prázdný"),
    editorRoleId: z.coerce.number().int().positive("Role musí být vybrána"),
});

export type CreateUserFormSchema = z.infer<typeof createUserFormSchema>;
