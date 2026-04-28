import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { INFO_PAGES, VALID_SLUGS, InfoSlug } from '@/config/infoPages'
import InfoLayout from '@/components/info/InfoLayout'
import { getGlobalData } from '@/lib/api/globals'

import { AboutSection } from '@/components/info/sections/AboutSection'
import { ContactsSection } from '@/components/info/sections/ContactsSection'
import { DeliverySection } from '@/components/info/sections/DeliverySection'
import { WarrantySection } from '@/components/info/sections/WarrantySection'
import { FAQSection } from '@/components/info/sections/FAQSection'
import { CareersSection } from '@/components/info/sections/CareersSection'

// 🧠 1. Карта соответствия: URL slug -> Payload Global slug
// Заполни те, которые у тебя уже есть в globals (согласно скриншоту)
const GLOBAL_SLUG_MAP: Partial<Record<InfoSlug, any>> = {
  about: 'about', // Твой файл About.ts
  contacts: 'contacts', // Твой файл Contacts.ts
  // Если создашь файлы Delivery.ts или FAQ.ts в globals, просто добавь их сюда:
  // delivery: 'delivery',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const pageData = INFO_PAGES[slug as InfoSlug]
  return { title: `${pageData?.title || 'Инфо-центр'} | PC-STORE` }
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  if (!VALID_SLUGS.includes(slug as InfoSlug)) {
    notFound()
  }

  const safeSlug = slug as InfoSlug

  // 🧠 2. Пытаемся получить данные из Payload, если для этого слага есть глобалка
  let cmsData = null
  const payloadGlobalName = GLOBAL_SLUG_MAP[safeSlug]

  if (payloadGlobalName) {
    cmsData = await getGlobalData(payloadGlobalName)
  }

  // 🧠 3. Рендерим нужную секцию и передаем в неё данные (если они есть)
  const renderSection = () => {
    // Превращаем null в undefined для опциональных пропсов
    const data = cmsData ?? undefined

    switch (safeSlug) {
      case 'about':
        return <AboutSection data={data as any} />
      case 'contacts':
        return <ContactsSection data={data as any} />
      case 'delivery':
        return <DeliverySection data={data as any} />
      case 'returns':
        return <WarrantySection isReturns data={data as any} />
      case 'warranty':
        return <WarrantySection data={data as any} />
      case 'faq':
        return <FAQSection data={data as any} />
      case 'jobs':
        return <CareersSection data={data as any} />
      default:
        notFound()
    }
  }

  return <InfoLayout activeSlug={safeSlug}>{renderSection()}</InfoLayout>
}
