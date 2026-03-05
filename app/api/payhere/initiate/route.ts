import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    // 1. Ensure the user is securely logged in
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in to checkout." }, { status: 401 });
    }

    const body = await req.json();
    const { items } = body; // Array of { id, quantity }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Calculate the REAL total from the database
    let total = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } });
      if (!product) throw new Error(`Product ${item.id} not found`);
      if (product.stock < item.quantity) throw new Error(`Not enough stock for ${product.name}`);

      const price = Number(product.price);
      total += price * item.quantity;

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price: price, // Snapshot the price at the time of purchase
      });
    }

    // 3. Create the Order in the database (Status: PENDING)
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        total: total,
        status: "PENDING",
        items: {
          create: orderItemsData,
        },
      },
    });

    // 4. Generate the secure PayHere MD5 Hash
    const merchantId = process.env.PAYHERE_MERCHANT_ID || "1234567"; // Fallback for local testing
    const merchantSecret = process.env.PAYHERE_SECRET || "local_secret";
    const orderId = order.id;
    // PayHere requires exactly 2 decimal places
    const amountFormatted = parseFloat(total.toString()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, '');
    const currency = "USD"; // Or "LKR"

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;
    const hash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    // 5. Construct the payload PayHere expects
    const payherePayload = {
      sandbox: true, // Sandbox mode for testing
      merchant_id: merchantId,
      return_url: `${process.env.NEXTAUTH_URL}/success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cancel`,
      notify_url: `${process.env.NEXTAUTH_URL}/api/payhere/notify`,
      order_id: orderId,
      items: "epicgenstore Order",
      amount: amountFormatted,
      currency: currency,
      hash: hash,
      first_name: session.user.name?.split(" ")[0] || "Customer",
      last_name: session.user.name?.split(" ")[1] || "",
      email: session.user.email || "",
      phone: "0000000000", // Would be collected in a real checkout form
      address: "123 Enterprise Way",
      city: "Tech City",
      country: "Sri Lanka",
    };

    return NextResponse.json(payherePayload);
  } catch (error) {
    console.error("Checkout Error:", error);
    // Securely check if the caught error is a standard Error object
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}