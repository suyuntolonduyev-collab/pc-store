import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './globals.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = 'https://github.com/payloadcms/payload/blob/main/src/app/(frontend)/page.tsx'

  return (
    <div className="container">
      <h1 className="title">Hello, {user ? user.name : 'Guest'}!</h1>
      <p className="description">This is a blank template using Payload in a Next.js app.</p>
      <p className="file-link font-mono">
        Open this file in VS Code: <a href="#">{fileURL}</a>
      </p>
    </div>
  )
}
