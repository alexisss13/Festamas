import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BranchLogos {
  isotipo?: string | null;
  isotipoWhite?: string | null;
  imagotipo?: string | null;
  imagotipoWhite?: string | null;
  alternate?: string | null;
}

export interface BranchUI {
  id: string;
  name: string;
  ecommerceCode: string | null;
  brandColors?: Record<string, string> | null;
  logos?: BranchLogos | null;
  address?: string | null;
  phone?: string | null;
}

interface UIState {
  activeBranchId: string | null;
  branches: BranchUI[];
  setBranches: (branches: BranchUI[]) => void;
  setActiveBranchId: (branchId: string) => void;

  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      branches: [],
      isCartOpen: false,
      setBranches: (branches) =>
        set((state) => {
          if (branches.length === 0) return state;
          const persistedActive = state.activeBranchId;
          const activeExists = branches.some((branch) => branch.id === persistedActive);
          const activeBranch = branches.find((branch) =>
            activeExists ? branch.id === persistedActive : branch.id === branches[0].id
          );
          return {
            branches,
            activeBranchId: activeBranch?.id ?? null,
          };
        }),
      setActiveBranchId: (branchId) =>
        set((state) => {
          const activeBranch = state.branches.find((branch) => branch.id === branchId);
          if (!activeBranch) return state;
          return {
            activeBranchId: activeBranch.id,
          };
        }),
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    }),
    {
      name: 'festamas-ui-settings',
    }
  )
);
