import type { Processor, Motherboard, Gpus, Ram, Psus, Case, Cooler, Storage } from '@/payload-types'

export type CompatibilityError = {
  type: 'error' | 'warning'
  message: string
}

interface BuildComponents {
  cpu: Processor | null
  mobo: Motherboard | null
  gpu: Gpus | null
  ram: Ram | null
  psu: Psus | null
  case: Case | null
  cooler: Cooler | null
  storage: Storage | null
}

export const checkCompatibility = (build: BuildComponents): CompatibilityError[] => {
  const errors: CompatibilityError[] = []

  const { cpu, mobo, gpu, ram, psu, case: pcCase, cooler } = build

  // 1. CPU ↔ Motherboard socket
  if (cpu && mobo && cpu.socket !== mobo.socket) {
    errors.push({
      type: 'error',
      message: `Сокет процессора (${cpu.socket}) не совместим с сокетом материнской платы (${mobo.socket})`,
    })
  }

  // 2. RAM type compatibility (CPU + Motherboard)
  if (ram) {
    if (cpu) {
      const ramSupportsCPU =
        (cpu.supports_ddr4 && ram.type === 'DDR4') || (cpu.supports_ddr5 && ram.type === 'DDR5')
      if (!ramSupportsCPU) {
        errors.push({
          type: 'error',
          message: `Тип оперативной памяти (${ram.type}) не поддерживается процессором`,
        })
      }
    }
    if (mobo) {
      const ramSupportedByMobo =
        (mobo.supports_ddr4 && ram.type === 'DDR4') || (mobo.supports_ddr5 && ram.type === 'DDR5')
      if (!ramSupportedByMobo) {
        errors.push({
          type: 'error',
          message: `Тип оперативной памяти (${ram.type}) не поддерживается материнской платой`,
        })
      }
    }
  }

  // 3. PSU wattage >= GPU recommended + 100W
  if (psu && gpu) {
    if (psu.wattage < gpu.recommended_psu_w + 100) {
      errors.push({
        type: 'error',
        message: `Мощность блока питания (${psu.wattage}W) меньше рекомендуемой для видеокарты (${gpu.recommended_psu_w + 100}W)`,
      })
    }
  }

  // 4. GPU length fits in case
  if (pcCase && gpu) {
    if (pcCase.max_gpu_length_mm < gpu.length_mm) {
      errors.push({
        type: 'error',
        message: `Длина видеокарты (${gpu.length_mm} мм) превышает допустимую длину корпуса (${pcCase.max_gpu_length_mm} мм)`,
      })
    }
  }

  // 5. Cooler height fits in case
  if (pcCase && cooler) {
    if (pcCase.max_cooler_height_mm < cooler.height_mm) {
      errors.push({
        type: 'error',
        message: `Высота кулера (${cooler.height_mm} мм) превышает допустимую высоту корпуса (${pcCase.max_cooler_height_mm} мм)`,
      })
    }
  }

  // 6. Cooler socket compatibility with CPU
  if (cpu && cooler) {
    const coolerSupportsSocket =
      (cpu.socket === 'LGA1700' && cooler.supports_lga1700) ||
      (cpu.socket === 'AM4' && cooler.supports_am4) ||
      (cpu.socket === 'AM5' && cooler.supports_am5)
    if (!coolerSupportsSocket) {
      errors.push({
        type: 'error',
        message: `Кулер не совместим с сокетом процессора (${cpu.socket})`,
      })
    }
  }

  // 7. Case supports motherboard form factor
  if (pcCase && mobo) {
    const supported =
      (mobo.form_factor === 'ATX' && pcCase.supports_atx) ||
      (mobo.form_factor === 'Micro-ATX' && pcCase.supports_matx) ||
      (mobo.form_factor === 'Mini-ITX' && pcCase.supports_itx)
    if (!supported) {
      errors.push({
        type: 'error',
        message: `Корпус не поддерживает форм-фактор материнской платы (${mobo.form_factor})`,
      })
    }
  }

  // 8. CPU must have integrated graphics if GPU is not selected
  if (cpu && !gpu && !cpu.has_graphics) {
    errors.push({
      type: 'warning',
      message: `У процессора нет встроенной графики, а видеокарта не выбрана`,
    })
  }

  return errors
}
