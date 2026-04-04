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
    };
  }

  interface User {
    role: string;
    managedSportIds: number[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    personnelId: number;
    role: string;
    managedSportIds: number[];
  }
}
