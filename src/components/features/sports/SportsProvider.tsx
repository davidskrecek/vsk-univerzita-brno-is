"use client";

import React, { createContext, useContext } from "react";

export interface AppSport {
  id: number;
  name: string;
  isCompetitive: boolean;
  description: string | null;
}

interface SportsContextType {
  sports: AppSport[];
}

const SportsContext = createContext<SportsContextType | undefined>(undefined);

export const SportsProvider = ({
  children,
  initialSports,
}: {
  children: React.ReactNode;
  initialSports: AppSport[];
}) => {
  return (
    <SportsContext.Provider value={{ sports: initialSports }}>
      {children}
    </SportsContext.Provider>
  );
};

export const useSports = () => {
  const context = useContext(SportsContext);
  if (context === undefined) {
    return { sports: [] };
  }
  return context;
};
