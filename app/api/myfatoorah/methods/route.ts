import { NextResponse } from "next/server";

const API_BASE = process.env.MYFATOORAH_API_BASE || "https://api.myfatoorah.com";

export async function GET() {
  const apiKey = process.env.MYFATOORAH_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: "MyFatoorah is not configured" }, { status: 503 });
  }

  try {
    const response = await fetch(`${API_BASE}/v2/InitiatePayment`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ InvoiceAmount: 69, CurrencyIso: "EGP" }),
      cache: "no-store",
    });

    const result = await response.json();
    if (!response.ok || !result?.IsSuccess) {
      return NextResponse.json({ ok: false, error: result?.Message || "Unable to load payment methods" }, { status: 502 });
    }

    const methods = (result?.Data?.PaymentMethods || [])
      .filter((method: any) => method?.PaymentMethodId && method?.IsDirectPayment === false)
      .map((method: any) => ({
        id: method.PaymentMethodId,
        nameAr: method.PaymentMethodAr || method.PaymentMethodEn,
        nameEn: method.PaymentMethodEn,
        code: method.PaymentMethodCode,
        imageUrl: method.ImageUrl,
        totalAmount: method.TotalAmount,
        paymentCurrency: method.PaymentCurrencyIso,
      }));

    return NextResponse.json({ ok: true, methods });
  } catch {
    return NextResponse.json({ ok: false, error: "Unable to load payment methods" }, { status: 500 });
  }
}
