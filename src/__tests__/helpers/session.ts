import type { AppSession } from "@/lib/session";

export const mockSuperadminSession: AppSession = {
  user: {
    email: "admin@vsk.cz",
    name: "Adam Novák",
    personnelId: 1,
    role: "superadmin",
    managedSportIds: [],
  },
};

export const mockSportManagerSession: AppSession = {
  user: {
    email: "trener@vsk.cz",
    name: "Petr Dvořák",
    personnelId: 2,
    role: "sport_manager",
    managedSportIds: [1],
  },
};
