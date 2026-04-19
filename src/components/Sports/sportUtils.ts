export interface SportApiItem {
  id: number;
  name: string;
  isCompetitive: boolean;
}

export interface SportsByType {
  competitiveSports: string[];
  recreationalSports: string[];
}

export const splitSportsByType = (sports: SportApiItem[]): SportsByType => {
  const sorted = [...sports].sort((a, b) => a.name.localeCompare(b.name, "cs"));

  return {
    competitiveSports: sorted.filter((sport) => sport.isCompetitive).map((sport) => sport.name),
    recreationalSports: sorted.filter((sport) => !sport.isCompetitive).map((sport) => sport.name),
  };
};