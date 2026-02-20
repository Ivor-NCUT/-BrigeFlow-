export interface Tag {
  id: string;
  label: string;
  category: 'industry' | 'skill' | 'relationship' | 'location' | 'custom' | 'role';
  color: string;
}

export interface CommunicationRecord {
  id: string;
  contactId: string;
  date: string;
  type: 'connection' | 'purchase' | 'invitation' | 'service' | 'other';
  summary: string;
  followUp?: {
    date: string;
    note: string;
    done: boolean;
  };
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  company: string;
  bonjourLink: string;
  tags: Tag[];
  notes: string;
  createdAt: string;
  lastContactedAt: string;
  communicationRecords: CommunicationRecord[];
  connections: string[]; // IDs of connected contacts
  connectionType: Record<string, string>; // connectionId -> relationship description
  interactionCount: number;
  shareVisible: boolean;
  sensitiveNotes: string;
}

export interface Relationship {
  id: string;
  sourceContactId: string;
  targetContactId: string;
  type: string;
  strength?: number;
  createdAt?: number;
}

export interface FilterState {
  search: string;
  industry: string;
  skill: string;
  relationship: string;
  location: string;
  role: string;
}

export interface ShareConfig {
  isPublic: boolean;
  showIndustry: boolean;
  showSkills: boolean;
  showNotes: boolean;
  showConnections: boolean;
  customDomain: string;
  selectedContacts: string[];
}

export interface SharedPage {
  id: string;
  slug: string;
  title: string;
  config: ShareConfig;
  createdAt: string;
}
