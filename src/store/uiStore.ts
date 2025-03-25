import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isMobile: boolean;
}

interface UIState {
  sidebar: SidebarState;
  isLoading: boolean;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setIsMobile: (isMobile: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      // State
      sidebar: {
        isOpen: true,
        isMobile: false,
      },
      isLoading: false,

      // Actions
      toggleSidebar: () => 
        set((state) => ({ 
          sidebar: { 
            ...state.sidebar, 
            isOpen: !state.sidebar.isOpen 
          } 
        })),
      
      setSidebarOpen: (isOpen) => 
        set((state) => ({ 
          sidebar: { 
            ...state.sidebar, 
            isOpen 
          } 
        })),
      
      setIsMobile: (isMobile) => 
        set((state) => ({
          sidebar: {
            ...state.sidebar,
            isMobile,
            isOpen: isMobile ? false : state.sidebar.isOpen,
          }
        })),
      
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'blexi-ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebar: state.sidebar,
      }),
    }
  )
);