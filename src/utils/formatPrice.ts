// utils/formatPrice.ts

type FormatPriceOptions = {
  currency?: string // Символ валюты, по умолчанию ₽
  short?: boolean // Сокращать большие числа (1_000_000 → 1.0 млн)
}

/**
 * Форматирует цену в удобочитаемый вид
 * Примеры:
 *  1234 → "1 234 ₽"
 *  1234567 → "1 234 567 ₽" или "1.2 млн ₽" (если short=true)
 */
const formatPrice = (
  price: number | null | undefined,
  options: FormatPriceOptions = {},
): string => {
  if (price == null) return ''

  const { currency = '₽', short = false } = options

  // Сокращаем большие числа
  if (short) {
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(1)} млрд ${currency}`
    }
    if (price >= 1_000_000) {
      return `${(price / 1_000_000).toFixed(1)} млн ${currency}`
    }
    if (price >= 1_000) {
      return `${(price / 1_000).toFixed(0)} тыс ${currency}`
    }
  }

  // Полное форматирование с разделителями тысяч
  return `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  }).format(price)} ${currency}`
}

export default formatPrice
