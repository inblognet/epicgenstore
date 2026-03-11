// app/(admin)/admin/layout.tsx
import { AdminLoadingProvider } from "@/components/admin/admin-loading-provider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // This invisibly wraps ALL your admin pages so the loader is always ready!
    <AdminLoadingProvider>
      {children}
    </AdminLoadingProvider>
  );
}