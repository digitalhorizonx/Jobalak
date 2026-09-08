"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function PaymentVerification() {
  const params = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"checking" | "success" | "error">("checking");

  useEffect(() => {
    if (!token) {
      setState("error");
      return;
    }

    let cancelled = false;
    fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token }),
    })
      .then(async (response) => {
        const data = await response.json();
        if (!cancelled) setState(response.ok && data?.ok ? "success" : "error");
      })
      .catch(() => {
        if (!cancelled) setState("error");
      });

    return () => { cancelled = true; };
  }, [token]);

  return (
    <>
      {state === "checking" && <><h1>بنأكد عملية الدفع...</h1><p>استنى ثواني، بنراجع العملية مباشرة مع PayPal.</p></>}
      {state === "success" && <><h1>تم الدفع بنجاح ✓</h1><p>PayPal أكد عملية الدفع بنجاح.</p></>}
      {state === "error" && <><h1>الدفع لسه مش مؤكد.</h1><p>ما فعلناش أي طلب لأننا ما استلمناش تأكيد دفع مكتمل من PayPal.</p></>}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main>
      <nav className="nav shell"><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><span className="navBadge">AI Job Hunter</span></nav>
      <section className="pageHero shell">
        <span className="eyebrow">تأكيد الدفع</span>
        <Suspense fallback={<><h1>بنأكد عملية الدفع...</h1><p>استنى ثواني، بنراجع العملية مباشرة مع PayPal.</p></>}>
          <PaymentVerification />
        </Suspense>
        <div className="infoCard" style={{ marginTop: 24 }}>
          <Link className="cta" style={{ display: "block", textAlign: "center" }} href="/">الرجوع لـ Jobalak</Link>
        </div>
      </section>
    </main>
  );
}
