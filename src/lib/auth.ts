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

        const email = credentials.email.trim().toLowerCase();
        console.log(`[AUTH] Attempting login for: ${email}`);

        const editor = await prisma.editor.findFirst({
          where: { personnel: { email } },
          include: {
            personnel: true,
            editorRole: true,
            managedSports: { select: { sportId: true } },
          },
        });

        if (!editor) {
          console.log(`[AUTH] User not found in DB: ${email}`);
          return null;
        }

        console.log(`[AUTH] User found, checking password...`);

        if (editor.lockedUntil && editor.lockedUntil > new Date()) {
          throw new Error("AccountLocked");
        }

        console.log(`[AUTH] Password length: ${credentials.password.length}`);
        
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
          managedSportIds: editor.managedSports.map((ms) => ms.sportId),
          permissions: (editor.permissions as any) || {},
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.personnelId = Number(user.id);
        token.role = (user as any).role;
        token.managedSportIds = (user as any).managedSportIds;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.personnelId = token.personnelId as number;
        session.user.role = token.role as any;
        session.user.managedSportIds = token.managedSportIds as number[];
        session.user.permissions = token.permissions as Record<string, boolean>;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
};

