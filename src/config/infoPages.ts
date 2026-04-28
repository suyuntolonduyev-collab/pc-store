import {
  Building2,
  Truck,
  RefreshCcw,
  ShieldCheck,
  HelpCircle,
  MapPin,
  Briefcase,
} from 'lucide-react'

export const INFO_PAGES = {
  about: {
    title: 'О компании',
    icon: Building2,
  },
  delivery: {
    title: 'Доставка и оплата',
    icon: Truck,
  },
  returns: {
    title: 'Возврат и обмен',
    icon: RefreshCcw,
  },
  warranty: {
    title: 'Гарантия',
    icon: ShieldCheck,
  },
  faq: {
    title: 'Вопросы и ответы',
    icon: HelpCircle,
  },
  contacts: {
    title: 'Контакты',
    icon: MapPin,
  },
  jobs: {
    title: 'Вакансии',
    icon: Briefcase,
  },
} as const

export type InfoSlug = keyof typeof INFO_PAGES
export const VALID_SLUGS = Object.keys(INFO_PAGES) as InfoSlug[]
