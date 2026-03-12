// app/api/admin/export-data/route.ts
// cspell:ignore openxmlformats officedocument spreadsheetml
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model");

  // 🚀 FIXED: Replaced 'any' with a strict Record type
  let exportData: Record<string, unknown>[] = [];

  try {
    if (model === "product") {
      const products = await prisma.product.findMany({
        include: { categories: true, tags: true },
        orderBy: { createdAt: 'desc' }
      });

      exportData = products.map(p => ({
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        salePrice: p.salePrice ? Number(p.salePrice) : "",
        stock: p.stock,
        imageUrl: p.imageUrl || "",
        categories: p.categories.map(c => c.slug).join(","), // Formatted exactly for re-import!
        tags: p.tags.map(t => t.slug).join(","),
        description: typeof p.description === 'string' ? p.description : (p.description ? JSON.stringify(p.description) : "")
      }));

    } else if (model === "category") {
      const categories = await prisma.category.findMany({ orderBy: { name: 'asc' }});
      exportData = categories.map(c => ({
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl || ""
      }));

    } else if (model === "tag") {
      const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' }});
      exportData = tags.map(t => ({
        name: t.name,
        slug: t.slug,
        title: t.title || ""
      }));

    } else if (model === "voucher") {
      const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' }});
      exportData = vouchers.map(v => ({
        code: v.code,
        discountType: v.discountType,
        discountValue: Number(v.discountValue),
        // 🚀 FIXED: Removed 'maxUses' and added 'isActive' to match your Prisma schema
        isActive: v.isActive,
        expiryDate: v.expiryDate ? v.expiryDate.toISOString().split('T')[0] : ""
      }));

    } else {
      return new NextResponse("Invalid model requested", { status: 400 });
    }

    if (exportData.length === 0) {
       // If empty, generate a placeholder row so it doesn't crash Excel
       exportData = [{ note: `No data found in the database for ${model}` }];
    }

    // Create a new Excel workbook and add the data sheet
    const worksheet = xlsx.utils.json_to_sheet(exportData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Backup_Data");

    // Convert to a buffer
    const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Generate a dynamic filename with today's date (e.g., product_backup_2026-03-12.xlsx)
    const dateStr = new Date().toISOString().split('T')[0];

    // Send the file to the browser
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${model}_backup_${dateStr}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error) {
    console.error("Data Export Error:", error);
    return new NextResponse("An error occurred while exporting data.", { status: 500 });
  }
}