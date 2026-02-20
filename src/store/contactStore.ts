/**
 * [INPUT]: 依赖后端 API (client.api) 进行数据 CRUD
 * [OUTPUT]: 对外提供 useContactStore hook，管理 contacts, tags, relationships 等全局状态
 * [POS]: store/contactStore，前端数据中心，负责状态管理与后端同步
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand';
import { client } from '../lib/client';
import type { Contact, Tag, CommunicationRecord, FilterState, ShareConfig, Relationship, SharedPage } from '../types/contact';

interface ContactStore {
  contacts: Contact[];
  allTags: Tag[];
  relationships: Relationship[];
  sharedPages: SharedPage[];
  filter: FilterState;
  shareConfig: ShareConfig;
  selectedContactId: string | null;
  editingContactId: string | null;
  quickAddInitialName: string;
  sidebarCollapsed: boolean;
  quickAddOpen: boolean;
  activeView: 'cards' | 'table' | 'gallery';
  currentPage: string;
  searchModalOpen: boolean;
  showAddRecordForm: boolean;
  addRecordInitialSummary: string;
  importStatus: { isImporting: boolean; total: number; processed: number } | null;

  setFilter: (filter: Partial<FilterState>) => void;
  setSelectedContact: (id: string | null) => void;
  setEditingContactId: (id: string | null) => void;
  setQuickAddInitialName: (name: string) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  setShowAddRecordForm: (show: boolean) => void;
  setAddRecordInitialSummary: (summary: string) => void;
  setActiveView: (view: 'cards' | 'table' | 'gallery') => void;
  setCurrentPage: (page: string) => void;
  setImportStatus: (status: { isImporting: boolean; total?: number; processed?: number } | null) => void;
  
  fetchData: () => Promise<void>;
  fetchSharedPages: () => Promise<void>; // Added
  createSharedPage: (page: Partial<SharedPage>) => Promise<void>; // Added
  deleteSharedPage: (id: string) => Promise<void>; // Added

  addContact: (contact: any) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContacts: (ids: string[]) => Promise<void>;
  
  addRelationship: (rel: Partial<Relationship>) => Promise<void>;
  updateRelationship: (id: string, updates: Partial<Relationship>) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;

  addCommunicationRecord: (contactId: string, record: any) => Promise<void>;
  updateShareConfig: (config: Partial<ShareConfig>) => void;
  
  getFilteredContacts: () => Contact[];
  getInactiveContacts: () => Contact[];
  getWeeklyStats: () => any;
  getAvatarColor: (name: string) => string;
}

export const useContactStore = create<ContactStore>((set, get) => ({
  contacts: [],
  allTags: [],
  relationships: [],
  sharedPages: [],
  filter: { search: '', industry: '', skill: '', relationship: '', location: '', role: '' },
  shareConfig: { isPublic: false, showIndustry: true, showSkills: true, showNotes: false, showConnections: true, customDomain: 'my-network', selectedContacts: [] },
  selectedContactId: null,
  editingContactId: null,
  quickAddInitialName: '',
  sidebarCollapsed: false,
  quickAddOpen: false,
  searchModalOpen: false,
  showAddRecordForm: false,
  addRecordInitialSummary: '',
  activeView: 'table',
  currentPage: 'dashboard',
  importStatus: null,

  setFilter: (f) => set((s) => ({ filter: { ...s.filter, ...f } })),
  setSelectedContact: (id) => set({ selectedContactId: id }),
  setEditingContactId: (id) => set({ editingContactId: id }),
  setQuickAddInitialName: (name) => set({ quickAddInitialName: name }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setQuickAddOpen: (open) => set({ quickAddOpen: open }),
  setSearchModalOpen: (open) => set({ searchModalOpen: open }),
  setShowAddRecordForm: (show) => set({ showAddRecordForm: show }),
  setAddRecordInitialSummary: (summary) => set({ addRecordInitialSummary: summary }),
  setActiveView: (view) => set({ activeView: view }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setImportStatus: (status) => set({ importStatus: status }),

  fetchSharedPages: async () => {
    try {
      const res = await client.api.fetch('/api/shared-pages');
      if (res.ok) {
        const pages = await res.json();
        const parsedPages = pages.map((p: any) => ({
          ...p,
          config: typeof p.config === 'string' ? JSON.parse(p.config) : p.config
        }));
        set({ sharedPages: parsedPages });
      }
    } catch (e) {
      console.error("Failed to fetch shared pages", e);
    }
  },

  createSharedPage: async (page) => {
    try {
      const res = await client.api.fetch('/api/shared-pages', {
        method: 'POST',
        body: JSON.stringify(page)
      });
      if (res.ok) {
        await get().fetchSharedPages();
      }
    } catch (e) {
      console.error("Failed to create shared page", e);
    }
  },

  deleteSharedPage: async (id) => {
    try {
      const res = await client.api.fetch(`/api/shared-pages/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await get().fetchSharedPages();
      }
    } catch (e) {
      console.error("Failed to delete shared page", e);
    }
  },

  fetchData: async () => {
    try {
      const [contactsRes, tagsRes, relsRes] = await Promise.all([
        client.api.fetch('/api/contacts'),
        client.api.fetch('/api/tags'),
        client.api.fetch('/api/relationships')
      ]);
      
      if (contactsRes.ok && tagsRes.ok) {
        const contactsData = await contactsRes.json();
        const tagsData = await tagsRes.json();
        const relsData = relsRes.ok ? await relsRes.json() : [];
        
        const mappedContacts = contactsData.map((c: any) => {
          const connections: string[] = [];
          const connectionType: Record<string, string> = {};
          
          relsData.forEach((r: any) => {
            if (r.sourceContactId === c.id) {
              connections.push(r.targetContactId);
              connectionType[r.targetContactId] = r.type;
            } else if (r.targetContactId === c.id) {
              connections.push(r.sourceContactId);
              connectionType[r.sourceContactId] = r.type;
            }
          });

          return {
            ...c,
            communicationRecords: (c.communicationRecords || []).map((r: any) => ({
              ...r,
              followUp: r.followUpDate ? {
                date: r.followUpDate,
                note: r.followUpNote,
                done: !!r.followUpDone
              } : undefined
            })),
            connections,
            connectionType
          };
        });
        
        set({ contacts: mappedContacts, allTags: tagsData, relationships: relsData });
      }
    } catch (e) {
      console.error("Failed to fetch data", e);
    }
  },

  addRelationship: async (rel) => {
    // Optimistic update
    const tempId = 'temp-' + Date.now();
    set(state => ({
      relationships: [...state.relationships, { ...rel, id: tempId } as Relationship]
    }));

    const res = await client.api.fetch('/api/relationships', {
      method: 'POST',
      body: JSON.stringify(rel)
    });
    if (res.ok) {
      get().fetchData();
    } else {
        // Revert on failure
        set(state => ({
            relationships: state.relationships.filter(r => r.id !== tempId)
        }));
    }
  },

  updateRelationship: async (id, updates) => {
    const res = await client.api.fetch(`/api/relationships/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    if (res.ok) {
      get().fetchData();
    }
  },

  removeRelationship: async (id) => {
    const res = await client.api.fetch(`/api/relationships/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      get().fetchData();
    }
  },

  addContact: async (contact) => {
    const res = await client.api.fetch('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contact)
    });
    if (res.ok) {
      get().fetchData();
    }
  },

  updateContact: async (id, updates) => {
    console.log('[updateContact] 请求更新联系人:', id, updates);
    const res = await client.api.fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    console.log('[updateContact] 响应状态:', res.status, res.ok);
    if (res.ok) {
      const data = await res.json();
      console.log('[updateContact] 更新成功，返回数据:', data);
      get().fetchData();
    } else {
      const errorText = await res.text();
      console.error('[updateContact] 更新失败:', res.status, errorText);
      throw new Error(`更新失败: ${res.status} - ${errorText}`);
    }
  },

  deleteContacts: async (ids) => {
    const res = await client.api.fetch('/api/contacts', {
      method: 'DELETE',
      body: JSON.stringify({ ids })
    });
    if (res.ok) {
      get().fetchData();
    }
  },

  addCommunicationRecord: async (contactId, record) => {
    const backendRecord = {
      contactId,
      date: record.date,
      type: record.type,
      summary: record.summary,
      details: record.details,
      followUpDate: record.followUp?.date,
      followUpNote: record.followUp?.note,
      followUpDone: record.followUp?.done ? 1 : 0
    };
    
    const res = await client.api.fetch('/api/communication_records', {
      method: 'POST',
      body: JSON.stringify(backendRecord)
    });
    if (res.ok) {
      get().fetchData();
    }
  },

  updateShareConfig: (config) => set((s) => ({ shareConfig: { ...s.shareConfig, ...config } })),

  getFilteredContacts: () => {
    const { contacts, filter } = get();
    return contacts.filter(c => {
      if (filter.search) {
        const q = filter.search.toLowerCase();
        const matchName = c.name.toLowerCase().includes(q);
        const matchTag = c.tags.some(t => t.label.toLowerCase().includes(q));
        const matchCompany = (c.company || '').toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchCompany) return false;
      }
      if (filter.industry && !c.tags.some(t => t.category === 'industry' && t.label === filter.industry)) return false;
      if (filter.skill && !c.tags.some(t => t.category === 'skill' && t.label === filter.skill)) return false;
      if (filter.relationship && !c.tags.some(t => t.category === 'relationship' && t.label === filter.relationship)) return false;
      if (filter.location && !c.tags.some(t => t.category === 'location' && t.label === filter.location)) return false;
      if (filter.role && !c.tags.some(t => t.category === 'role' && t.label === filter.role)) return false;
      return true;
    });
  },

  getInactiveContacts: () => {
    const { contacts } = get();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return contacts.filter(c => new Date(c.lastContactedAt) < sixMonthsAgo);
  },

  getWeeklyStats: () => {
    const { contacts } = get();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    const newContacts = contacts.filter(c => c.createdAt >= weekStr).length;
    const communications = contacts.reduce((sum, c) =>
      sum + c.communicationRecords.filter(r => r.date >= weekStr).length, 0
    );
    const followUps = contacts.reduce((sum, c) =>
      sum + c.communicationRecords.filter(r => r.followUp && !r.followUp.done && r.followUp.date >= weekStr).length, 0
    );

    const industryMap: Record<string, number> = {};
    contacts.forEach(c => c.tags.filter(t => t.category === 'industry').forEach(t => {
      industryMap[t.label] = (industryMap[t.label] || 0) + 1;
    }));
    const topIndustries = Object.entries(industryMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([label, count]) => ({ label, count }));

    return { newContacts, communications, followUps, topIndustries };
  },

  getAvatarColor: (name: string) => {
    const avatarColors = ['#007AFF', '#5AC8FA', '#34C759', '#FF9500', '#AF52DE', '#FF3B30', '#00C7BE', '#005BB5'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return avatarColors[Math.abs(hash) % avatarColors.length];
  }
}));