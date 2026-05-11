import {z} from "zod";

export const resetPasswordSchema = z
    .object({
        token: z.string().min(1),
        oldPassword: z.string().optional(),
        password: z.string().min(8),
        confirmPassword: z.string(),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Hesla se neshodují",
            });
        }
    });

export const resetPasswordFormSchema = z
    .object({
        oldPassword: z.string().optional(),
        password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
        confirmPassword: z.string().min(1, "Prosím potvrďte heslo."),
    })
    .superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["confirmPassword"],
                message: "Hesla se neshodují",
            });
        }
    });

export type ResetPasswordFormSchema = z.infer<typeof resetPasswordFormSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

