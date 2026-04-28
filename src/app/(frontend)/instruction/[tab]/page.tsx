import { notFound } from 'next/navigation'
import InstructionPageView, { TabId } from '@/components/instruction/InstructionPageView'
import { getInstructionData } from '@/lib/api/instruction'

// ⚡ 2. Реальный SSR-кеш между запросами (1 час)
export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ tab: string }> }) {
  const { tab } = await params
  return {
    title:
      tab === 'configurator'
        ? 'Инструкция к конфигуратору | PC-STORE'
        : 'Как собрать ПК | PC-STORE',
  }
}

// 🧠 3. Простая типизация и меньше edge-cases
export default async function InstructionPageSegment({
  params,
}: {
  params: Promise<{ tab: string }>
}) {
  const { tab } = await params

  if (tab !== 'builder' && tab !== 'configurator') {
    notFound()
  }

  const activeTab: TabId = tab

  try {
    const data = await getInstructionData(
      activeTab === 'configurator' ? 'instruction-configurator' : 'instruction',
    )
    return <InstructionPageView data={data} activeTab={activeTab} />
  } catch (error) {
    console.error(error)
    notFound()
  }
}
