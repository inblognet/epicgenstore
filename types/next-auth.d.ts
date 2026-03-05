import { type DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "CUSTOMER"
    } & DefaultSession["user"]
  }

  interface User {
    // We add a '?' here so the Prisma Adapter doesn't panic during OAuth creation
    role?: "ADMIN" | "CUSTOMER"
  }
}