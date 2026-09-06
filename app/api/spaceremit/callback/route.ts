import { NextResponse } from "next/server";

const PAYMENT_INFO_URL = "https://spaceremit.com/api/v2/payment_info/";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const paymentId = payload?.payment_id ?? payload?.id;
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ received: false }, { status: 400 });
    }

    const secretKey = process.env.SPACEREMIT_SECRET_KEY;
    const publicKey = process.env.SPACEREMIT_PUBLIC_KEY;
    if (!secretKey || !publicKey) {
      return NextResponse.json({ received: false }, { status: 503 });
    }

    const response = await fetch(PAYMENT_INFO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ private_key: secretKey, payment_id: paymentId }),
      cache: "no-store",
    });
    const result = await response.json();
    const payment = result?.data;

    const authentic =
      response.ok &&
      result?.response_status === "success" &&
      payment?.id === paymentId &&
      payment?.seller_public_key === publicKey;

    if (!authentic) {
      return NextResponse.json({ received: false }, { status: 401 });
    }

    // Callback is authenticated against Spaceremit before acknowledgement.
    // Persist/fulfil the Jobalak search order here once the order database is connected.
    console.info("Spaceremit callback verified", {
      paymentId: payment.id,
      status: payment.status,
      statusTag: payment.status_tag,
      amount: payment.original_amount,
      currency: payment.currency,
    });

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
