import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Processor, Motherboard, Gpus, Ram, Psus, Case, Cooler, Storage 
} from '@/payload-types';
import { checkCompatibility } from '@/utils/compatibilityChecker';

export interface BuildSlots {
  cpu: Processor | null;
  mobo: Motherboard | null;
  gpu: Gpus | null;
  ram: Ram | null;
  psu: Psus | null;
  case: Case | null;
  cooler: Cooler | null;
  storage: Storage | null;
}

interface BuilderState {
  build: BuildSlots;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  selectComponent: <K extends keyof BuildSlots>(slot: K, component: BuildSlots[K]) => void;
  removeComponent: (slot: keyof BuildSlots) => void;
  resetBuild: () => void;
  getCompatibilityErrors: () => ReturnType<typeof checkCompatibility>;
  getTotalPrice: () => number;
  isBuildComplete: () => boolean;
}

const initialBuild: BuildSlots = {
  cpu: null,
  mobo: null,
  gpu: null,
  ram: null,
  psu: null,
  case: null,
  cooler: null,
  storage: null,
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      build: initialBuild,
      _hasHydrated: false,
      
      setHasHydrated: (state) => {
        set({ _hasHydrated: state });
      },

      selectComponent: (slot, component) => {
        set((state) => ({
          build: { ...state.build, [slot]: component },
        }));
      },

      removeComponent: (slot) => {
        set((state) => ({
          build: { ...state.build, [slot]: null },
        }));
      },

      resetBuild: () => {
        set({ build: initialBuild });
      },

      getCompatibilityErrors: () => {
        const { build } = get();
        return checkCompatibility(build);
      },

      getTotalPrice: () => {
        const { build } = get();
        return Object.values(build).reduce((total, component) => {
          if (component && typeof component.price === 'number') {
            return total + component.price;
          }
          return total;
        }, 0);
      },

      isBuildComplete: () => {
        const { build } = get();
        
        // Базовые компоненты
        const requiredSlots: (keyof BuildSlots)[] = ['cpu', 'mobo', 'ram', 'psu', 'case', 'cooler', 'storage'];
        const hasBaseComponents = requiredSlots.every((slot) => build[slot] !== null);

        if (!hasBaseComponents) return false;

        // Умная проверка GPU: если у процессора нет встроенной графики, дискретная карта обязательна
        const cpu = build.cpu;
        const requiresDiscreteGpu = cpu && cpu.has_graphics === false;

        if (requiresDiscreteGpu && build.gpu === null) {
          return false;
        }

        return true;
      }
    }),
    {
      name: 'builder-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
        }
      },
    }
  )
);