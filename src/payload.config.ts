import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

import { Processors } from './collections/Processors'
import { GPUs } from './collections/GPUs'
import { RAM } from './collections/RAM'
import { PSUs } from './collections/PSUs'
import { Cases } from './collections/Cases'
import { Coolers } from './collections/Coolers'
import { Storage } from './collections/Storage'
import { Builds } from './collections/Builds'
import { Orders } from './collections/Orders'
import Motherboards from './collections/Motherboards'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  localization: {
    locales: [
      { label: 'English', code: 'en' },
      { label: 'Русский', code: 'ru' },
      { label: 'Кыргызча', code: 'ky' },
    ],
    defaultLocale: 'en', // обязательно
    fallback: true, // если перевода нет — вернёт дефолтный язык
  },
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Motherboards,
    Processors,
    GPUs,
    RAM,
    PSUs,
    Cases,
    Coolers,
    Storage,
    Builds,
    Orders,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  plugins: [
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
})
