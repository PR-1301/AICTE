import { create } from 'zustand';
import { ROLE } from '../constants';

export const useAppStore = create((set) => ({
  // Current portal role (set from Login screen)
  currentRole: null,
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

  // Logout — clears role, returns to login
  logout: () => set({ currentRole: null }),

  // Reset store back to clean seed defaults
  resetStore: () =>
    set({
      statusFilter: 'ALL',
      searchQuery: '',
      selectedAppId: 'APP-001',
      selectedFindingId: null,
    }),
}));
