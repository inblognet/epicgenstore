// app/api/admin/export-template/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as xlsx from "xlsx";

// Define the exact column headers for each model
const TEMPLATES = {
  product: [
    { name: "Sample Product", slug: "sample-product", price: 150000, salePrice: 145000, stock: 10, imageUrl: "/placeholder.jpg", categories: "laptops,gaming", tags: "new,intel", description: "Standard text description" }
  ],
  category: [
    { name: "Gaming Laptops", slug: "gaming-laptops", parentId: "", imageUrl: "" }
  ],
  voucher: [
    { code: "SUMMER2024", discountType: "PERCENTAGE", discountValue: 10, maxUses: 100, expiryDate: "2024-12-31" }
  ],
  tag: [
    { name: "New Arrival", slug: "new-arrival", title: "Condition" }
  ]
};

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const model = searchParams.get("model") as keyof typeof TEMPLATES;

  if (!model || !TEMPLATES[model]) {
    return new NextResponse("Invalid model requested", { status: 400 });
  }

  // Create a new Excel workbook and add the template sheet
  const worksheet = xlsx.utils.json_to_sheet(TEMPLATES[model]);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Template");

  // Convert to a buffer
  const excelBuffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

  // Send the file to the browser
  return new NextResponse(excelBuffer, {
    headers: {
      "Content-Disposition": `attachment; filename="${model}_template.xlsx"`,
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  });
}