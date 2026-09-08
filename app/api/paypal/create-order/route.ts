import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

async function accessToken() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("missing_paypal_credentials");
  const basic = Buffer.from(id + ":" + secret).toString("base64");
  const response = await fetch(PAYPAL_API + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + basic,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error("paypal_auth_failed");
  return data.access_token as string;
}

export async function POST() {
  try {
    const token = await accessToken();
    const response = await fetch(PAYPAL_API + "/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: "Jobalak AI Job Search",
          amount: { currency_code: "USD", value: "1.50" },
        }],
      }),
      cache: "no-store",
    });
    const data = await response.json();
    if (!response.ok || !data.id) return NextResponse.json({ ok: false }, { status: 502 });
    return NextResponse.json({ ok: true, id: data.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
