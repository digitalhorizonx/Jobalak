import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

async function accessToken() {
  const id = process.env.PAYPAL_CLIENT_ID?.trim();
  const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
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

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.access_token) throw new Error("paypal_auth_failed");
  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const token = await accessToken();
    const origin = new URL(request.url).origin;

    const response = await fetch(PAYPAL_API + "/v2/checkout/orders", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json",
        Prefer: "return=representation",
        "PayPal-Request-Id": randomUUID(),
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            description: "Jobalak AI Job Search",
            amount: { currency_code: "USD", value: "1.50" },
          },
        ],
        application_context: {
          brand_name: "Jobalak",
          user_action: "PAY_NOW",
          shipping_preference: "NO_SHIPPING",
          return_url: origin + "/payment/success",
          cancel_url: origin + "/?payment=cancelled",
        },
      }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    const approveUrl = data?.links?.find((link: { rel?: string }) => link.rel === "approve")?.href
      || data?.links?.find((link: { rel?: string }) => link.rel === "payer-action")?.href;

    if (!response.ok || !data.id || !approveUrl) {
      return NextResponse.json({ ok: false, error: "paypal_order_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, id: data.id, approveUrl });
  } catch (error) {
    const code = error instanceof Error ? error.message : "paypal_unavailable";
    const safeError = code === "missing_paypal_credentials" || code === "paypal_auth_failed"
      ? code
      : "paypal_unavailable";
    return NextResponse.json({ ok: false, error: safeError }, { status: 500 });
  }
}
