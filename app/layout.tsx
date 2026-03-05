// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { prisma } from "@/lib/prisma";
import { CartHydration } from "@/components/client/cart-hydration";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "epicgenstore",
  description: "Empowering Tech Solutions, Every Day.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, categories] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: 'asc' },
      include: {
        children: {
          orderBy: { name: 'asc' }
        }
      }
    })
  ]);

  const safeSettings = settings || {
    contactPhone: "0112 95 9005",
    contactEmail: "info@epicgenstore.lk",
    contactAddress: "Sri Lanka",
    footerAboutText: "Empowering Tech Solutions, Every Day.",
    storeName: "EPIC STORE",
    themePreset: "theme-epic-dark"
  };

  const activeTheme = settings?.themePreset || "theme-epic-dark";

  return (
    <html lang="en" className={`dark ${activeTheme}`}>
      <body className={`${inter.className} antialiased min-h-screen flex flex-col bg-surface-bg text-theme-main transition-colors duration-300`}>
        <Providers>
          <CartHydration />

          <Navbar
            categories={categories}
            settings={safeSettings}
          />

          <main className="flex-1">
            {children}
          </main>

          <Footer settings={{
            ...safeSettings,
            storeName: safeSettings.storeName || "EPIC STORE"
          }} />
        </Providers>
      </body>
    </html>
  );
}