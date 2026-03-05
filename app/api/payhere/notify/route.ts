// app/api/payhere/notify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // PayHere sends data as a URL-encoded form, NOT as standard JSON
    const formData = await req.formData();

    // Extract the exact fields PayHere sends
    const merchant_id = formData.get("merchant_id") as string;
    const order_id = formData.get("order_id") as string;
    const payhere_amount = formData.get("payhere_amount") as string;
    const payhere_currency = formData.get("payhere_currency") as string;
    const status_code = formData.get("status_code") as string;
    const md5sig = formData.get("md5sig") as string;

    // 1. Verify the Security Signature
    const merchantSecret = process.env.PAYHERE_SECRET || "local_secret";

    // The exact formula required by PayHere's documentation
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${hashedSecret}`;
    const generatedSig = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    if (generatedSig !== md5sig) {
      console.error("🚨 SECURITY ALERT: PayHere Signature Mismatch!");
      // We return 400 Bad Request to reject the fake payload
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Update the Database based on the Status Code
    // In PayHere, Status Code "2" means the payment was a complete success
    if (status_code === "2") {
      await prisma.order.update({
        where: { id: order_id },
        data: { status: "PAID" },
      });
      console.log(`✅ Order ${order_id} securely marked as PAID!`);
    }
    // Status Codes -1, -2, -3 mean Canceled, Failed, or Charged Back
    else if (status_code === "-1" || status_code === "-2" || status_code === "-3") {
      await prisma.order.update({
        where: { id: order_id },
        // Fix: Updated to "CANCELLED" to strictly match the Prisma enum
        data: { status: "CANCELLED" },
      });
      console.error(`❌ Order ${order_id} marked as CANCELLED.`);
    }

    // 3. Acknowledge Receipt
    // We MUST return a 200 OK so PayHere knows we received the message,
    // otherwise they will keep re-sending it for days.
    return new NextResponse("OK", { status: 200 });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse("Webhook Processing Error", { status: 500 });
  }
}