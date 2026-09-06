import { NextResponse } from "next/server";

const PAYMENT_INFO_URL = "https://spaceremit.com/api/v2/payment_info/";
const EXPECTED_AMOUNT = "69.00";
const EXPECTED_CURRENCY = "EGP";

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();
    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json({ ok: false, error: "Missing payment id" }, { status: 400 });
    }

    const secretKey = process.env.SPACEREMIT_SECRET_KEY;
    const publicKey = process.env.SPACEREMIT_PUBLIC_KEY;
    if (!secretKey || !publicKey) {
      return NextResponse.json({ ok: false, error: "Payment gateway is not configured" }, { status: 503 });
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
      return NextResponse.json({ ok: false, error: "Payment authentication failed" }, { status: 400 });
    }

    const amountMatches = Number(payment.original_amount) === Number(EXPECTED_AMOUNT);
    const currencyMatches = payment.currency === EXPECTED_CURRENCY;
    const acceptedStatus = ["A", "B", "D", "E", "T"].includes(payment.status_tag);

    if (!amountMatches || !currencyMatches || !acceptedStatus) {
      return NextResponse.json({
        ok: false,
        error: "Payment details do not match this order",
        payment: {
          id: payment.id,
          status: payment.status,
          statusTag: payment.status_tag,
          amount: payment.original_amount,
          currency: payment.currency,
        },
      }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      test: payment.status_tag === "T",
      payment: {
        id: payment.id,
        status: payment.status,
        statusTag: payment.status_tag,
        amount: payment.original_amount,
        currency: payment.currency,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to verify payment" }, { status: 500 });
  }
}
