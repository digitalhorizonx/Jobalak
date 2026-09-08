import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

async function accessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("missing_paypal_credentials");
  const basic = Buffer.from(id + ":" + secret).toString("base64");
  const response = await fetch(PAYPAL_API + "/v1/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + basic, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("paypal_auth_failed");
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = typeof body.orderId === "string" ? body.orderId : "";
    if (!orderId || !/^[A-Z0-9]+$/i.test(orderId)) return NextResponse.json({ ok: false }, { status: 400 });

    const token = await accessToken();
    const response = await fetch(PAYPAL_API + "/v2/checkout/orders/" + encodeURIComponent(orderId) + "/capture", {
      method: "POST",
      headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: "{}",
      cache: "no-store",
    });
    const data = await response.json();
    const capture = data?.purchase_units?.[0]?.payments?.captures?.[0];
    const verified = response.ok && data?.status === "COMPLETED" && capture?.status === "COMPLETED" && capture?.amount?.currency_code === "USD" && capture?.amount?.value === "1.50";
    if (!verified) return NextResponse.json({ ok: false, error: "payment_not_verified" }, { status: 400 });

    return NextResponse.json({ ok: true, orderId: data.id, captureId: capture.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
