import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  dateRange: {
    startDate: string | null;
    endDate: string | null;
  };
  selectedAssetType: string | null;
  selectedStatus: string | null;
  
  setSearchQuery: (query: string) => void;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setSelectedAssetType: (assetType: string | null) => void;
  setSelectedStatus: (status: string | null) => void;
  clearFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  dateRange: {
    startDate: null,
    endDate: null,
  },
  selectedAssetType: null,
  selectedStatus: null,

  setSearchQuery: (query) => set({ searchQuery: query }),

  setDateRange: (startDate, endDate) =>
    set({ dateRange: { startDate, endDate } }),

  setSelectedAssetType: (assetType) => set({ selectedAssetType: assetType }),

  setSelectedStatus: (status) => set({ selectedStatus: status }),

  clearFilters: () =>
    set({
      searchQuery: '',
      dateRange: { startDate: null, endDate: null },
      selectedAssetType: null,
      selectedStatus: null,
    }),
}));

export default useFilterStore;



