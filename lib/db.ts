import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

function getDirectUrl(url: string): string {
  if (url.startsWith('prisma+postgres://')) {
    try {
      const parsedUrl = new URL(url)
      const apiKey = parsedUrl.searchParams.get('api_key')
      if (apiKey) {
        const decoded = Buffer.from(apiKey, 'base64').toString('utf-8')
        const data = JSON.parse(decoded)
        if (data.databaseUrl) {
          return data.databaseUrl
        }
      }
    } catch (e) {
      console.error('Failed to parse prisma+postgres URL, using fallback:', e)
    }
  }
  // Standard postgres:// or postgresql:// url, return as is
  return url
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is missing')
}

const directUrl = getDirectUrl(connectionString)

const pool = new pg.Pool({ connectionString: directUrl })
const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
