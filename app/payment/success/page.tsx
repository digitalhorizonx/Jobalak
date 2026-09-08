"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type State = "checking" | "success" | "free" | "error";

function PaymentVerification() {
  const params = useSearchParams();
  const token = params.get("token");
  const isFree = params.get("free") === "1";
  const [state, setState] = useState<State>(isFree ? "free" : "checking");
  const [shared, setShared] = useState(false);

  useEffect(() => {
    if (isFree) return;
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
  }, [token, isFree]);

  const referralCode = useMemo(() => {
    if (typeof window === "undefined") return "";
    let code = window.localStorage.getItem("jobalak:referralCode");
    if (!code) {
      code = Math.random().toString(36).slice(2, 8).toUpperCase() + Date.now().toString(36).slice(-4).toUpperCase();
      window.localStorage.setItem("jobalak:referralCode", code);
    }
    return code;
  }, []);

  function inviteOnWhatsApp() {
    if (!referralCode) return;
    const referralUrl = `https://jobalak.com/?ref=${encodeURIComponent(referralCode)}`;
    const text = `بتدور على شغل؟ جرب Jobalak 👀\nارفع الـCV واختار الدول وسيب المنصة تدورلك على الفرص المناسبة.\n${referralUrl}`;
    const alreadyRewarded = window.localStorage.getItem("jobalak:referralRewarded") === "1";
    if (!alreadyRewarded) {
      const current = Number(window.localStorage.getItem("jobalak:freeAttempts") || "0");
      window.localStorage.setItem("jobalak:freeAttempts", String(Math.max(0, current) + 1));
      window.localStorage.setItem("jobalak:referralRewarded", "1");
    }
    setShared(true);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <>
      {state === "checking" && <><h1>بنأكد عملية الدفع...</h1><p>استنى ثواني، بنراجع العملية مباشرة مع PayPal.</p></>}
      {state === "success" && <><h1>تم الدفع بنجاح ✓</h1><p>PayPal أكد عملية الدفع. طلب البحث أصبح مؤكد.</p><div className="referralCard"><span className="referralEmoji">🎁</span><h2>عايز محاولة كمان مجانًا؟</h2><p>ابعت Jobalak لصاحبك على واتساب وخد محاولة بحث مجانية بدل ما تدفع مرة تانية.</p><button className="whatsappCta" type="button" onClick={inviteOnWhatsApp}>ادعي صاحبك على واتساب</button>{shared && <div className="paymentNotice success">اتضافتلك محاولة مجانية 🎉 هتلاقيها لما ترجع للصفحة الرئيسية.</div>}<small>هدية دعوة واحدة لكل مستخدم في النسخة الحالية.</small></div></>}
      {state === "free" && <><h1>تم استخدام المحاولة المجانية 🎁</h1><p>طلب البحث الجديد اتسجل باستخدام رصيد الدعوة.</p></>}
      {state === "error" && <><h1>الدفع لسه مش مؤكد.</h1><p>ما فعلناش أي طلب لأننا ما استلمناش تأكيد دفع مكتمل من PayPal.</p></>}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main>
      <nav className="nav shell"><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><span className="navBadge">AI Job Hunter</span></nav>
      <section className="pageHero shell">
        <span className="eyebrow">تأكيد الطلب</span>
        <Suspense fallback={<><h1>بنأكد العملية...</h1><p>استنى ثواني.</p></>}><PaymentVerification /></Suspense>
        <div className="infoCard" style={{ marginTop: 24 }}><Link className="cta" style={{ display: "block", textAlign: "center" }} href="/">الرجوع لـ Jobalak</Link></div>
      </section>
    </main>
  );
}
