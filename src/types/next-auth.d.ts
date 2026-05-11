import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      name?: string | null;
      image?: string | null;
      personnelId: number;
      role: string;
      managedSportIds: number[];
      permissions: Record<string, boolean>;
    };
  }

  interface User {
    role: string;
    managedSportIds: number[];
    permissions: Record<string, boolean>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    personnelId: number;
    role: string;
    managedSportIds: number[];
    permissions: Record<string, boolean>;
  }
}

