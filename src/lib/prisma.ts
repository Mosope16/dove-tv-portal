// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  // 1. Create a raw Postgres connection pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  
  // 2. Wrap it in the Prisma Adapter
  const adapter = new PrismaPg(pool)
  
  // 3. Pass the adapter to the Prisma Client!
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma