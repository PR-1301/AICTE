import { create } from 'zustand';
import { AUDIT_ACTOR } from '../constants';

export const useAppStore = create((set) => ({
  // Current user/officer role
  currentRole: AUDIT_ACTOR.OFFICER,
  setRole: (role) => set({ currentRole: role }),

  // Global filters
  statusFilter: 'ALL',
  setStatusFilter: (filter) => set({ statusFilter: filter }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Selected application & finding for quick navigation
  selectedAppId: 'APP-001',
  setSelectedAppId: (id) => set({ selectedAppId: id }),
  selectedFindingId: null,
  setSelectedFindingId: (fid) => set({ selectedFindingId: fid }),
}));
