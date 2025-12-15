import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Division = 'JUGUETERIA' | 'FIESTAS';

interface UIState {
  currentDivision: Division;
  setDivision: (division: Division) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      currentDivision: 'JUGUETERIA', // Default: Festamas
      setDivision: (division) => set({ currentDivision: division }),
    }),
    {
      name: 'festamas-ui-settings', // Guardado en localStorage
    }
  )
);