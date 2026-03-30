import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Processor, Motherboard, Gpus, Ram, Psus, Case, Cooler, Storage } from '@/payload-types'
import { checkCompatibility, type CompatibilityError } from '@/utils/compatibilityChecker'

type ComponentType = 'cpu' | 'mobo' | 'gpu' | 'ram' | 'psu' | 'case' | 'cooler' | 'storage'

type ComponentValue = Processor | Motherboard | Gpus | Ram | Psus | Case | Cooler | Storage

interface BuildState {
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
  build: BuildState

  selectComponent: (type: ComponentType, component: ComponentValue) => void
  removeComponent: (type: ComponentType) => void
  resetBuild: () => void

  getCompatibilityErrors: () => CompatibilityError[]
  calculateTotalPrice: () => number
}

const initialBuild: BuildState = {
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

      selectComponent: (type, component) => {
        set((state) => ({
          build: {
            ...state.build,
            [type]: component,
          },
        }))
      },

      removeComponent: (type) => {
        set((state) => ({
          build: {
            ...state.build,
            [type]: null,
          },
        }))
      },

      resetBuild: () => {
        set({ build: initialBuild })
      },

      getCompatibilityErrors: () => {
        const { build } = get()

        return checkCompatibility({
          cpu: build.cpu,
          mobo: build.mobo,
          gpu: build.gpu,
          ram: build.ram,
          psu: build.psu,
          case: build.case,
          cooler: build.cooler,
          storage: build.storage,
        })
      },

      calculateTotalPrice: () => {
        const { build } = get()

        const components: Array<ComponentValue | null> = [
          build.cpu,
          build.mobo,
          build.gpu,
          build.ram,
          build.psu,
          build.case,
          build.cooler,
          build.storage,
        ]

        return components.reduce((total, item) => {
          if (!item || typeof item.price !== 'number') return total
          return total + item.price
        }, 0)
      },
    }),
    {
      name: 'builder-store',
    },
  ),
)
