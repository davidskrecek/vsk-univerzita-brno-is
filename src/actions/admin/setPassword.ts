"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {ResetPasswordSchema, resetPasswordSchema} from "@/schemas/auth/resetPasswordSchema";

export type ResetPasswordState = {
    success?: boolean;
    error?: string;
    fieldErrors?: Record<string, string[]>;
};

export async function setPassword(values: ResetPasswordSchema): Promise<ResetPasswordState> {
    try {
        const parsed = resetPasswordSchema.safeParse(values);

        if (!parsed.success) {
            return {
                error: "Validation failed.",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const { token, password } = parsed.data;

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const passwordHash = await bcrypt.hash(password, 12);

        return await prisma.$transaction(async (tx) => {
            const invitation =
                await tx.accountInvitation.findFirst({
                        where: {
                            tokenHash,
                            usedAt: null,
                            expiresAt: {
                                gt: new Date(),
                            },
                        },
                    });

                if (!invitation) {
                    return {
                        error: "Invalid or expired invitation",
                    };
                }

                await tx.editor.update({
                    where: {
                        personnelId:
                        invitation.personnelId,
                    },
                    data: {
                        passwordHash,
                    },
                });

                await tx.accountInvitation.update({
                        where: {
                            id: invitation.id,
                        },
                        data: {
                            usedAt: new Date(),
                        },
                    }
                );

                return {
                    success: true,
                };
            }
        );
    } catch (e) {
        console.error(e);

        return {
            error: "Failed to reset password.",
        };
    }
}
