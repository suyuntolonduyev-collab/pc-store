import React from 'react'

// --- ТИПИЗАЦИЯ (Senior Level) ---

export type TextNode = {
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  [key: string]: unknown
}

export type RichTextNode = {
  type: string
  tag?: string | number
  listType?: 'bullet' | 'number'
  children?: (TextNode | RichTextNode)[]
  [key: string]: unknown
}

export type LexicalContent = {
  root: {
    children: RichTextNode[]
  }
}

export type SlateContent = RichTextNode[]

export type RichTextContent = string | LexicalContent | SlateContent | null | undefined

// --- ВСПОМОГАТЕЛЬНЫЕ РЕНДЕРЕРЫ ---

/**
 * Обрабатывает инлайн-стили текста (Bold, Italic, Code и т.д.)
 */
const renderTextNodes = (children?: (TextNode | RichTextNode)[]) => {
  if (!children) return null

  return children.map((node, i) => {
    // Если это вложенный узел (например, ссылка внутри текста), рекурсивно обрабатываем
    if ('type' in node && node.type !== 'text') {
      return null // Здесь можно добавить поддержку LinkNode, если нужно
    }

    const c = node as TextNode
    let textElement: React.ReactNode = c.text || ''

    if (c.bold) textElement = <strong key={`b-${i}`}>{textElement}</strong>
    if (c.italic) textElement = <em key={`i-${i}`}>{textElement}</em>
    if (c.underline) textElement = <u key={`u-${i}`}>{textElement}</u>
    if (c.strikethrough) textElement = <s key={`s-${i}`}>{textElement}</s>
    if (c.code) {
      textElement = (
        <code
          key={`c-${i}`}
          className="bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm text-pink-600"
        >
          {textElement}
        </code>
      )
    }

    return <React.Fragment key={`text-${i}`}>{textElement}</React.Fragment>
  })
}

// --- ОСНОВНОЙ РЕНДЕРЕР ---

/**
 * Главная функция рендеринга RichText контента из Payload CMS
 */
export const renderRichText = (content: RichTextContent) => {
  if (!content) return null

  // 1. Обработка обычной строки
  if (typeof content === 'string') {
    return <p className="mb-6 leading-relaxed text-gray-800">{content}</p>
  }

  // 2. Обработка Lexical (Payload 3.0+)
  if (typeof content === 'object' && 'root' in content && content.root?.children) {
    return content.root.children.map((node, i) => {
      const key = `${node.type}-${i}`

      switch (node.type) {
        case 'paragraph':
          const pText = renderTextNodes(node.children)
          if (!pText || (Array.isArray(pText) && pText.length === 0)) return <br key={key} />
          return (
            <p key={key} className="mb-6 leading-relaxed text-gray-800">
              {pText}
            </p>
          )

        case 'heading':
          // 🛡️ Защита от h7+ и невалидных значений
          const match = String(node.tag || node.tag).match(/\d+/)
          const level = Math.min(Math.max(match ? Number(match[0]) : 2, 1), 6)
          const Tag = `h${level}` as React.ElementType

          return (
            <Tag key={key} className="font-black text-gray-900 mt-12 mb-6 tracking-tight">
              {renderTextNodes(node.children)}
            </Tag>
          )

        case 'list':
          const ListTag = node.listType === 'bullet' ? 'ul' : 'ol'
          return (
            <ListTag key={key} className="mb-8 ml-6 list-outside space-y-3 text-gray-800">
              {(node.children as RichTextNode[]).map((listItem, li) => (
                <li
                  key={`${key}-${li}`}
                  className={node.listType === 'bullet' ? 'list-disc pl-2' : 'list-decimal pl-2'}
                >
                  {renderTextNodes(listItem.children)}
                </li>
              ))}
            </ListTag>
          )

        case 'quote':
          return (
            <blockquote
              key={key}
              className="border-l-4 border-blue-600 pl-6 my-10 italic text-gray-500 text-xl md:text-2xl leading-relaxed"
            >
              {renderTextNodes(node.children)}
            </blockquote>
          )

        default:
          return null
      }
    })
  }

  // 3. Обработка Slate (Legacy/Array format)
  if (Array.isArray(content)) {
    return content.map((node, i) => {
      const key = `slate-${node.type || 'p'}-${i}`
      return (
        <p key={key} className="mb-6 leading-relaxed text-gray-800">
          {renderTextNodes(node.children)}
        </p>
      )
    })
  }

  // Fallback для отладки в режиме разработки
  if (process.env.NODE_ENV === 'development') {
    return (
      <pre className="bg-red-50 text-red-500 p-4 rounded-xl text-xs overflow-auto my-4">
        Unknown RichText Format: {JSON.stringify(content, null, 2)}
      </pre>
    )
  }

  return null
}
