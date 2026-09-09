"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window { paypal?: any; }
}

type Props = {
  onBeforePay: () => void;
  onError: (message: string) => void;
};

const SDK_ID = "jobalak-paypal-sdk";

export default function PayPalCheckout({ onBeforePay, onError }: Props) {
  const [loading, setLoading] = useState(true);
  const [cardReady, setCardReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [walletReady, setWalletReady] = useState(false);
  const cardSession = useRef<any>(null);

  useEffect(() => {
    let active = true;

    async function setup() {
      try {
        const tokenResponse = await fetch("/api/paypal/client-token", { cache: "no-store" });
        const tokenData = await tokenResponse.json();
        if (!tokenResponse.ok || !tokenData?.accessToken) throw new Error("token");

        if (!window.paypal) {
          await new Promise<void>((resolve, reject) => {
            const existing = document.getElementById(SDK_ID) as HTMLScriptElement | null;
            if (existing) {
              existing.addEventListener("load", () => resolve(), { once: true });
              existing.addEventListener("error", () => reject(new Error("sdk")), { once: true });
              return;
            }
            const script = document.createElement("script");
            script.id = SDK_ID;
            script.src = "https://www.paypal.com/web-sdk/v6/core";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("sdk"));
            document.head.appendChild(script);
          });
        }

        if (!active || !window.paypal?.createInstance) throw new Error("sdk");
        const sdk = await window.paypal.createInstance({ clientToken: tokenData.accessToken, components: ["card-fields", "paypal-payments"] });

        if (sdk.cardFields?.isEligible?.()) {
          const session = sdk.cardFields({
            createOrder: async () => {
              onBeforePay();
              const response = await fetch("/api/paypal/create-order", { method: "POST" });
              const data = await response.json();
              if (!response.ok || !data?.id) throw new Error("order");
              return { orderId: data.id };
            },
            onApprove: async (data: any) => {
              const orderId = data?.orderId || data?.orderID;
              if (orderId) window.location.assign("/payment/success?token=" + encodeURIComponent(orderId));
            },
            onError: () => onError("تعذر إتمام الدفع بالبطاقة. جرّب PayPal أو حاول مرة تانية."),
          });
          cardSession.current = session;
          await session.NameField().render("#paypal-card-name");
          await session.NumberField().render("#paypal-card-number");
          await session.ExpiryField().render("#paypal-card-expiry");
          await session.CVVField().render("#paypal-card-cvv");
          if (active) setCardReady(true);
        }

        if (sdk.paypalPayments) {
          const wallet = sdk.paypalPayments({
            createOrder: async () => {
              onBeforePay();
              const response = await fetch("/api/paypal/create-order", { method: "POST" });
              const data = await response.json();
              if (!response.ok || !data?.id) throw new Error("order");
              return { orderId: data.id };
            },
            onApprove: async (data: any) => {
              const orderId = data?.orderId || data?.orderID;
              if (orderId) window.location.assign("/payment/success?token=" + encodeURIComponent(orderId));
            },
            onError: () => onError("تعذر بدء PayPal. حاول مرة تانية."),
          });
          await wallet.render("#paypal-wallet-button");
          if (active) setWalletReady(true);
        }
      } catch {
        if (active) onError("تعذر تحميل وسائل الدفع. حاول مرة تانية بعد لحظات.");
      } finally {
        if (active) setLoading(false);
      }
    }

    setup();
    return () => { active = false; };
  }, [onBeforePay, onError]);

  async function submitCard() {
    if (!cardSession.current) return;
    setSubmitting(true);
    onError("");
    try {
      await cardSession.current.submit();
    } catch {
      onError("راجع بيانات البطاقة وحاول مرة تانية.");
      setSubmitting(false);
    }
  }

  return <div className="embeddedCheckout">
    {loading && <div className="paymentNotice">جاري تحميل طرق الدفع الآمنة...</div>}
    <div className={cardReady ? "cardCheckout" : "cardCheckout cardCheckoutHidden"}>
      <strong className="paymentMethodTitle">ادفع بالبطاقة</strong>
      <div className="paypalField" id="paypal-card-name" />
      <div className="paypalField" id="paypal-card-number" />
      <div className="cardFieldRow"><div className="paypalField" id="paypal-card-expiry" /><div className="paypalField" id="paypal-card-cvv" /></div>
      <button className="cta" type="button" disabled={submitting} onClick={submitCard}>{submitting ? "جاري تأكيد الدفع..." : "ادفع 1.50 USD بالبطاقة"}</button>
    </div>
    {cardReady && walletReady && <div className="paymentDivider"><span>أو</span></div>}
    <div id="paypal-wallet-button" className="paypalWallet" />
    {!loading && !cardReady && <p className="fine">الدفع المباشر بالبطاقة غير متاح لهذا الحساب حالياً؛ استخدم PayPal لإتمام العملية.</p>}
  </div>;
}
