export interface ContactApiPerson {
  id: string | number;
  firstName: string;
  lastName: string;
  role: string;
  sportName: string | null;
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
  email: string;
  phone: string | null;
}

export interface ContactSectionData {
  id: string;
  title: string;
  contacts: ContactPerson[];
}

