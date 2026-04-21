import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const data = {
  title: 'Как пользоваться конфигуратором',
  intro:
    'Наш умный конфигуратор не даст вам совершить ошибку. Следуйте простым шагам, чтобы собрать идеальный ПК.',
  steps: [
    {
      title: 'Шаг 1: Выбор процессора',
      description:
        'Начните с «сердца» компьютера. Выберите процессор от Intel или AMD. От этого выбора будет зависеть список доступных материнских плат (по сокету).',
      tip: 'Для игр обращайте внимание на показатели FPS в карточке процессора.',
    },
    {
      title: 'Шаг 2: Материнская плата',
      description:
        'Система автоматически отфильтрует платы, оставив только те, которые подходят к вашему процессору. Выберите нужный форм-фактор.',
      tip: 'Убедитесь, что плата поддерживает нужный тип памяти (DDR4 или DDR5).',
    },
    {
      title: 'Шаг 3: Видеокарта и питание',
      description:
        'При выборе видеокарты система учтет её длину для корпуса и рассчитает необходимую мощность блока питания с запасом.',
      tip: 'Для карт серии RTX 40 система подскажет, нужен ли блоку питания 16-pin коннектор.',
    },
  ],
}

async function seed() {
  const payload = await getPayload({ config: configPromise })
  try {
    await payload.updateGlobal({
      slug: 'instruction-configurator',
      data: data,
    })
    console.log(`✅ Global 'instruction-configurator' успешно обновлен`)
  } catch (err) {
    console.error(`❌ Ошибка при обновлении 'instruction-configurator':`, err)
  }
  process.exit(0)
}

seed()
