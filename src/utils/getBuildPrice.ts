import type { Build } from '@/payload-types'

export const getSingleBuildPrice = (build: Build): number => {
  const components = [
    build.cpu,
    build.mobo,
    build.gpu,
    build.ram,
    build.psu,
    build['case'],
    build.cooler,
    build.storage,
  ]

  return components.reduce((sum: number, comp): number => {
    if (comp && typeof comp === 'object' && 'price' in comp) {
      return sum + (typeof comp.price === 'number' ? comp.price : 0)
    }
    return sum
  }, 0)
}
