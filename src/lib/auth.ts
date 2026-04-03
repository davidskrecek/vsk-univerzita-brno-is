import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const editor = await prisma.editor.findFirst({
          where: { personnel: { email: credentials.email } },
          include: { personnel: true, editorRole: true },
        });

        if (!editor) return null;

        if (editor.lockedUntil && editor.lockedUntil > new Date()) {
          throw new Error("AccountLocked");
        }

        const valid = await bcrypt.compare(credentials.password, editor.passwordHash);

        if (!valid) {
          const attempts = editor.failedLoginAttempts + 1;
          const lockedUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
          await prisma.editor.update({
            where: { personnelId: editor.personnelId },
            data: { failedLoginAttempts: attempts, lockedUntil },
          });
          return null;
        }

        await prisma.editor.update({
          where: { personnelId: editor.personnelId },
          data: { failedLoginAttempts: 0, lockedUntil: null, lastLoginAt: new Date() },
        });

        return {
          id: String(editor.personnelId),
          email: editor.personnel.email,
          name: `${editor.personnel.firstName} ${editor.personnel.lastName}`,
          role: editor.editorRole.name,
          managedSportId: editor.managedSportId ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.personnelId = Number(user.id);
        token.role = (user as { role: string }).role;
        token.managedSportId = (user as { managedSportId: number | null }).managedSportId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.personnelId = token.personnelId as number;
      session.user.role = token.role as string;
      session.user.managedSportId = token.managedSportId as number | null;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};
