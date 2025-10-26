import { create } from 'zustand';

interface NavigationState {
  isMobileMenuOpen: boolean;
  isSidebarCollapsed: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isMobileMenuOpen: false,
  isSidebarCollapsed: false,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
}));

export default useNavigationStore;



