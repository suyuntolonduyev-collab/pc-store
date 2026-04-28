import { redirect } from 'next/navigation'

export default function InstructionIndex() {
  // 🎯 Чистый URL UX: мгновенно перенаправляем на дефолтный таб
  redirect('/instruction/builder')
}
