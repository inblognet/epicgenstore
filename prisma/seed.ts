// prisma/seed.ts
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const connectionString = `${process.env.DATABASE_URL}`
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Starting database seed...");

  const products = [
    {
      name: "Epic Mechanical Keyboard",
      slug: "epic-mechanical-keyboard",
      price: 129.99,
      imageUrl: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=60",
      stock: 50,
    },
    {
      name: "Pro Gaming Mouse",
      slug: "pro-gaming-mouse",
      price: 79.99,
      imageUrl: "https://images.unsplash.com/photo-1527814050087-379381547949?auto=format&fit=crop&w=500&q=60",
      stock: 120,
    },
    {
      name: "Ultra-Wide Monitor",
      slug: "ultra-wide-monitor",
      price: 499.00,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=60",
      stock: 15,
    },
    {
      name: "Noise-Cancelling Headphones",
      slug: "noise-cancelling-headphones",
      price: 249.50,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60",
      stock: 30,
    }
  ];

  for (const product of products) {
    // We use upsert so if you run this script twice, it doesn't create duplicate products
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log("✅ Seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });