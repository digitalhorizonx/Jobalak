import { NextResponse } from "next/server";

const PAYPAL_API = process.env.PAYPAL_API_BASE || "https://api-m.paypal.com";

export async function GET() {
  try {
    const id = process.env.PAYPAL_CLIENT_ID?.trim();
    const secret = process.env.PAYPAL_CLIENT_SECRET?.trim();
    if (!id || !secret) {
      return NextResponse.json({ ok: false, error: "missing_paypal_credentials" }, { status: 500 });
    }

    const basic = Buffer.from(id + ":" + secret).toString("base64");
    const response = await fetch(PAYPAL_API + "/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: "Basic " + basic,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials&response_type=client_token&intent=sdk_init",
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.access_token) {
      return NextResponse.json({ ok: false, error: "paypal_client_token_failed" }, { status: 502 });
    }

    return NextResponse.json({ ok: true, accessToken: data.access_token });
  } catch {
    return NextResponse.json({ ok: false, error: "paypal_unavailable" }, { status: 500 });
  }
}
