import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  Processor,
  Motherboard,
  Gpus,
  Ram,
  Psus,
  Case,
  Cooler,
  Storage,
} from '@/payload-types'
import { checkCompatibility } from '@/utils/compatibilityChecker'
import {
  GPU_POWER_SHARE,
  SYSTEM_BASE_POWER_W,
  POWER_HEADROOM_MULTIPLIER,
} from '@/utils/powerConstants'

export type ComponentValue = Processor | Motherboard | Gpus | Ram | Psus | Case | Cooler | Storage

export interface BuildSlots {
  cpu: Processor | null
  mobo: Motherboard | null
  gpu: Gpus | null
  ram: Ram | null
  psu: Psus | null
  case: Case | null
  cooler: Cooler | null
  storage: Storage | null
}

interface BuilderState {
  build: BuildSlots
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
  selectComponent: <K extends keyof BuildSlots>(slot: K, component: BuildSlots[K]) => void
  removeComponent: (slot: keyof BuildSlots) => void
  resetBuild: () => void
  // 🟢 ДОБАВЛЯЕМ НОВЫЙ МЕТОД В ИНТЕРФЕЙС
  setBuild: (build: BuildSlots) => void
  getCompatibilityErrors: () => ReturnType<typeof checkCompatibility>
  calculateTotalPrice: () => number
  getTotalWattage: () => number
  isBuildComplete: () => boolean
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
}

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      build: initialBuild,
      _hasHydrated: false,

      setHasHydrated: (state) => {
        set({ _hasHydrated: state })
      },

      selectComponent: (slot, component) => {
        const { build } = get()

        const updatedBuild: BuildSlots = { ...build, [slot]: component }

        if (slot === 'mobo' && build.ram) {
          const newMobo = component as Motherboard
          const currentRam = build.ram
          const isDdr4 = currentRam.type === 'DDR4'
          const moboSupportsRam = isDdr4 ? newMobo.supports_ddr4 : newMobo.supports_ddr5

          if (!moboSupportsRam) {
            updatedBuild.ram = null
          }
        }

        if (slot === 'cpu' && build.ram) {
          const newCpu = component as Processor
          const currentRam = build.ram
          const isDdr4 = currentRam.type === 'DDR4'
          const cpuSupportsRam = isDdr4 ? newCpu.supports_ddr4 : newCpu.supports_ddr5

          if (!cpuSupportsRam) {
            updatedBuild.ram = null
          }
        }

        set({ build: updatedBuild })
      },

      removeComponent: (slot) => {
        set((state) => ({
          build: { ...state.build, [slot]: null },
        }))
      },

      resetBuild: () => {
        set({ build: initialBuild })
      },

      // 🟢 РЕАЛИЗАЦИЯ НОВОГО МЕТОДА
      // Он просто заменяет текущее состояние сборки на то, что ему передали
      setBuild: (build) => {
        set({ build })
      },

      getCompatibilityErrors: () => {
        const { build } = get()
        return checkCompatibility(build)
      },

      calculateTotalPrice: () => {
        const { build } = get()
        return Object.values(build).reduce((total, component) => {
          if (component && typeof component.price === 'number') {
            return total + component.price
          }
          return total
        }, 0)
      },

      getTotalWattage: () => {
        const { build } = get()
        const cpuPower = build.cpu?.tdp ?? 0
        const gpuPower = build.gpu?.recommended_psu_w
          ? build.gpu.recommended_psu_w * GPU_POWER_SHARE
          : 0
        return (cpuPower + gpuPower + SYSTEM_BASE_POWER_W) * POWER_HEADROOM_MULTIPLIER
      },

      isBuildComplete: () => {
        const { build } = get()
        const requiredSlots: (keyof BuildSlots)[] = [
          'cpu',
          'mobo',
          'ram',
          'psu',
          'case',
          'cooler',
          'storage',
        ]

        const hasBaseComponents = requiredSlots.every((slot) => build[slot] != null)
        if (!hasBaseComponents) return false

        const requiresDiscreteGpu = build.cpu?.has_graphics === false
        if (requiresDiscreteGpu && build.gpu === null) {
          return false
        }

        return true
      },
    }),
    {
      name: 'builder-store',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true)
        }
      },
    },
  ),
)
