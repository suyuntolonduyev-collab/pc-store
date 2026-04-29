import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const postsData = [
  {
    title: 'Как выбрать блок питания в 2024 году: ATX 3.0 и новый разъем 12VHPWR',
    category: 'guides',
    excerpt:
      'Разбираемся, почему для новых видеокарт NVIDIA 40-й серии лучше покупать блоки питания нового стандарта и как не запутаться в сертификатах 80 PLUS.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr', // ✅ Обязательное поле для Lexical
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr', // ✅ Обязательное поле для параграфа
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Выбор блока питания — это не то место, где стоит экономить. С выходом стандарта ATX 3.0 блоки питания научились справляться с кратковременными скачками потребления (spikes), которые у флагманских карт могут достигать 200% от номинала...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'БП' }, { tag: 'ATX 3.0' }, { tag: 'Железо' }],
  },
  {
    title: 'RTX 4090 vs RX 7900 XTX: Битва титанов в 4K разрешении',
    category: 'reviews',
    excerpt:
      'Сравниваем флагманы от NVIDIA и AMD. Где важнее чистая производительность, а где — технологии трассировки лучей и генерации кадров.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Если вы собираете ультимативный компьютер, перед вами неизбежно встанет выбор между зеленым и красным лагерем. В этом обзоре мы протестировали карты в 15 современных играх...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'GPU' }, { tag: 'NVIDIA' }, { tag: 'AMD' }, { tag: '4K' }],
  },
  {
    title: 'Intel 14th Gen: Стоит ли обновляться на Raptor Lake Refresh?',
    category: 'news',
    excerpt:
      'Анализируем новую линейку процессоров Intel. Кому действительно принесет пользу переход на i7-14700K и почему i9-14900K — это выбор для экстремалов.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Четырнадцатое поколение Intel стало минорным обновлением, но с одним важным исключением — моделью i7-14700K, которая получила дополнительные энергоэффективные ядра...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'CPU' }, { tag: 'Intel' }, { tag: 'Raptor Lake' }],
  },
  {
    title: 'DDR5 против DDR4: Есть ли смысл переплачивать за новую платформу?',
    category: 'guides',
    excerpt:
      'Проводим тесты в играх и рабочих приложениях. Выясняем, при каких условиях частота 6000 МГц и выше дает ощутимый прирост производительности.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Оперативная память стандарта DDR5 уже стала массовой, а цены на нее сравнялись с DDR4. Однако переход на новую память требует замены материнской платы и часто самого процессора...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'RAM' }, { tag: 'DDR5' }, { tag: 'Сравнение' }],
  },
  {
    title: 'Почему ваш ПК перегревается? 5 главных ошибок при установке охлаждения',
    category: 'guides',
    excerpt:
      'От неправильного нанесения термопасты до ошибок в организации воздушных потоков внутри корпуса. Учимся охлаждать железо правильно.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Даже самый дорогой кулер не спасет ваш процессор, если внутри корпуса образовался "воздушный мешок". В этой статье мы разберем правильную схему установки вентиляторов на вдув и выдув...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'Охлаждение' }, { tag: 'TDP' }, { tag: 'Сборка ПК' }],
  },
  {
    title: 'SSD Gen5: Будущее уже здесь, но нужно ли оно вам сейчас?',
    category: 'reviews',
    excerpt:
      'Тестируем накопители со скоростью 14 ГБ/с. Разбираемся, где реально заметна разница и почему такие диски требуют активного охлаждения.',
    content: {
      root: {
        type: 'root',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'paragraph',
            format: '',
            indent: 0,
            version: 1,
            direction: 'ltr',
            children: [
              {
                detail: 0,
                format: 0,
                mode: 'normal',
                style: '',
                text: 'Накопители пятого поколения PCIe поражают воображение своими цифрами в бенчмарках. Но в реальных сценариях загрузки игр разница с Gen4 пока составляет доли секунды...',
                type: 'text',
                version: 1,
              },
            ],
          },
        ],
      },
    },
    tags: [{ tag: 'SSD' }, { tag: 'PCIe 5.0' }, { tag: 'Storage' }],
  },
]

async function seed() {
  const payload = await getPayload({ config: configPromise })
  console.log("🚀 Сидирование коллекции 'posts' с исправленным Lexical JSON...")

  for (const post of postsData) {
    const existing = await payload.find({
      collection: 'posts',
      where: { title: { equals: post.title } },
    })

    if (existing.totalDocs === 0) {
      try {
        await payload.create({
          collection: 'posts',
          data: post as any, // Используем as any, если типизация всё еще конфликтует с автосгенерированными типами
        })
        console.log(`✅ Статья добавлена: ${post.title}`)
      } catch (err) {
        console.error(`❌ Ошибка создания статьи ${post.title}:`, err)
      }
    } else {
      console.log(`⏭️ Статья '${post.title}' уже существует.`)
    }
  }

  console.log('✨ Сидирование блога завершено!')
  process.exit(0)
}

seed()
