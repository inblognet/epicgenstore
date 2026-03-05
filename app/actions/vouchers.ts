// app/actions/vouchers.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function validateVoucherCode(code: string) {
  try {
    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
      include: { products: { select: { id: true } } }
    });

    if (!voucher) {
      return { success: false, error: "Invalid voucher code." };
    }

    if (!voucher.isActive) {
      return { success: false, error: "This voucher is no longer active." };
    }

    if (voucher.expiryDate && new Date(voucher.expiryDate) < new Date()) {
      return { success: false, error: "This voucher has expired." };
    }

    return {
      success: true,
      voucher: {
        code: voucher.code,
        type: voucher.discountType,
        value: Number(voucher.discountValue),
        productIds: voucher.products.map(p => p.id) // If empty, applies to whole cart
      }
    };
  } catch (error) {
    console.error("Voucher validation error:", error);
    return { success: false, error: "Failed to validate voucher." };
  }
}