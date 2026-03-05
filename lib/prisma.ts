// lib/prisma.ts
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = `${process.env.DATABASE_URL}`

// 1. Configure the native Postgres connection pool with explicit SSL handling
const pool = new Pool({
  connectionString,
  // Explicitly setting ssl configuration helps resolve the 'verify-full' warnings
  // especially when connecting to secure enterprise databases.
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined
})

// 2. Wrap the pool in Prisma's Postgres adapter
const adapter = new PrismaPg(pool)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// 3. Inject the adapter into the Prisma Client instance
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter })

// Prevent Next.js hot-reloading from exhausting your database connections in dev
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;