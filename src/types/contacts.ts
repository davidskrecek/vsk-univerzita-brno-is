export interface ContactItem {
  id: string | number;
  firstName: string;
  lastName: string;
  role: string;
  sportName: string | null;
  sportId: number | null;
  email: string;
  phone: string | null;
  roleGroup?: string | null;
  isActive?: boolean;
}

export interface ContactPerson {
  id: string;
  name: string;
  role: string;
  sport: string;
  sportId: number | null;
  email: string;
  phone: string | null;
  isActive: boolean;
}

export interface ContactSectionData {
  id: string;
  title: string;
  contacts: ContactPerson[];
}


