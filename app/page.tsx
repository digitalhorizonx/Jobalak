"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import PayPalCheckout from "./components/PayPalCheckout";

const countries = ["مصر", "السعودية", "الإمارات", "قطر", "الكويت", "الأردن", "ألمانيا", "هولندا", "المملكة المتحدة", "كندا", "أستراليا", "Remote"];
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["السعودية", "الإمارات"]);
  const [fileName, setFileName] = useState("");
  const [email, setEmail] = useState("");
  const [visa, setVisa] = useState("no");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [freeAttempts, setFreeAttempts] = useState(0);
  const [referred, setReferred] = useState(false);
  const remaining = useMemo(() => 5 - selected.length, [selected.length]);

  useEffect(() => {
    const storedCredits = Number(window.localStorage.getItem("jobalak:freeAttempts") || "0");
    setFreeAttempts(Number.isFinite(storedCredits) ? Math.max(0, storedCredits) : 0);
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) { window.localStorage.setItem("jobalak:referrer", ref.slice(0, 80)); setReferred(true); }
  }, []);

  function toggleCountry(country: string) {
    setSelected((current) => current.includes(country) ? current.filter((item) => item !== country) : current.length >= 5 ? current : [...current, country]);
  }

  function validateRequest() {
    if (!fileName) return "ارفع الـCV الأول عشان نبدأ البحث.";
    if (!isValidEmail(email)) return "اكتب إيميل صحيح لاستلام النتائج.";
    if (!selected.length) return "اختار دولة واحدة على الأقل.";
    return "";
  }

  const persistRequest = useCallback(() => {
    window.localStorage.setItem("jobalak:lastRequest", JSON.stringify({ email: email.trim().toLowerCase(), countries: selected, visa, fileName, referrer: window.localStorage.getItem("jobalak:referrer") || "", createdAt: new Date().toISOString() }));
  }, [email, selected, visa, fileName]);

  const checkoutError = useCallback((message: string) => setPaymentError(message), []);

  function openPayment() {
    const error = validateRequest();
    if (error) { setPaymentError(error); return; }
    setPaymentError(""); setPaymentOpen(true);
  }

  function useFreeAttempt() {
    const error = validateRequest();
    if (error) { setPaymentError(error); return; }
    if (freeAttempts < 1) return;
    persistRequest();
    const next = Math.max(0, freeAttempts - 1);
    window.localStorage.setItem("jobalak:freeAttempts", String(next));
    setFreeAttempts(next);
    window.location.assign("/payment/success?free=1");
  }

  return <main>
    <nav className="nav shell"><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><span className="navBadge">AI Job Hunter</span></nav>
    <section className="hero shell">
      <div className="heroCopy"><span className="eyebrow">بدل ما تدوّر بالساعات</span><h1>ارفع الـCV.<br />اختار الدول.<br /><span>وسيبلنا البحث.</span></h1><p>نحلل خبرتك، ندور على فرص مناسبة في الدول اللي تختارها، ونبعتلك أقوى النتائج على الإيميل.</p><div className="trustRow"><span>✓ بدون اشتراك</span><span>✓ بحث مخصص</span><span>✓ 69 جنيه فقط</span></div>{referred && <div className="creditBanner">🎁 وصلت لـJobalak عن طريق دعوة من صديق.</div>}{freeAttempts > 0 && <div className="creditBanner success">🎉 عندك {freeAttempts} محاولة مجانية جاهزة للاستخدام.</div>}</div>
      <div className="card">
        <div className="step"><span>1</span><div><strong>ارفع الـCV</strong><small>PDF أو DOCX — لحد 10MB</small></div></div>
        <label className="upload"><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} /><b>{fileName || "اضغط لرفع ملفك"}</b><small>{fileName ? "تم اختيار الملف" : "هنستخدمه عشان نفهم خبرتك ومهاراتك"}</small></label>
        <div className="step"><span>2</span><div><strong>فين حابب تشتغل؟</strong><small>اختار لحد 5 دول</small></div></div>
        <div className="chips">{countries.map((country) => <button key={country} type="button" className={selected.includes(country) ? "chip active" : "chip"} onClick={() => toggleCountry(country)}>{country}</button>)}</div>
        <small className="remaining">متبقي {remaining} اختيارات</small>
        <div className="fields"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="إيميلك لاستلام الفرص" /><select value={visa} onChange={(e) => setVisa(e.target.value)}><option value="no">لا أحتاج Visa Sponsorship</option><option value="yes">أحتاج Visa Sponsorship</option><option value="unsure">مش متأكد</option></select></div>
        {freeAttempts > 0 ? <button className="cta referralCta" type="button" onClick={useFreeAttempt}>استخدم المحاولة المجانية 🎁</button> : <button className="cta" type="button" onClick={openPayment}>ابدأ البحث بـ 69 جنيه</button>}
        {paymentError && !paymentOpen && <div className="paymentNotice error">{paymentError}</div>}
        <p className="fine">الدفع يتم بشكل آمن عبر PayPal. وبعد أول محاولة تقدر تدعي صاحبك على واتساب وتاخد محاولة مجانية.</p>
      </div>
    </section>
    <section className="how shell"><p className="sectionKicker">إزاي Jobalak بيشتغل؟</p><div className="grid3"><article><b>01</b><h3>نفهم الـCV</h3><p>نستخرج خبرتك، مهاراتك، مستوى الوظائف المناسب ليك، ونقاط القوة.</p></article><article><b>02</b><h3>ندور بدل منك</h3><p>نفلتر فرص حقيقية حسب الدول اللي اخترتها ومتطلبات كل وظيفة.</p></article><article><b>03</b><h3>نوصلهالك</h3><p>تستلم أفضل الفرص على الإيميل مع نسبة التوافق ورابط التقديم الرسمي.</p></article></div></section>
    <footer className="shell footer"><div><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><p>الجوب المناسب.. لحد عندك.</p></div><div className="footerLinks"><Link href="/about">من نحن</Link><Link href="/jobs">الوظائف</Link><Link href="/faq">الأسئلة الشائعة</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/privacy">الخصوصية</Link></div></footer>
    {paymentOpen && <div className="modalBackdrop"><section className="paymentModal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setPaymentOpen(false)}>×</button><span className="paymentIcon">✓</span><p className="sectionKicker">خطوة أخيرة ونبدأ البحث</p><h2>إتمام الدفع</h2><p className="muted">ادفع بالفيزا أو Mastercard مباشرة من Jobalak، أو استخدم حساب PayPal.</p><div className="orderRow"><span>Jobalak Job Search</span><strong>69 EGP</strong></div><PayPalCheckout onBeforePay={persistRequest} onError={checkoutError} />{paymentError && <div className="paymentNotice error">{paymentError}</div>}<p className="fine">معالجة بيانات البطاقة تتم بواسطة PayPal، وJobalak لا يخزن رقم البطاقة أو CVV. قيمة العملية لدى PayPal هي 1.50 USD.</p></section></div>}
  </main>;
}
