import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      email: string;
      name?: string | null;
      image?: string | null;
      personnelId: number;
      role: string;
      managedSportId: number | null;
    };
  }

  interface User {
    role: string;
    managedSportId: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    personnelId: number;
    role: string;
    managedSportId: number | null;
  }
}
