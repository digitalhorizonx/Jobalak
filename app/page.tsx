"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const countries = ["مصر", "السعودية", "الإمارات", "قطر", "الكويت", "الأردن", "ألمانيا", "هولندا", "المملكة المتحدة", "كندا", "أستراليا", "Remote"];
const SPACEREMIT_SCRIPT_ID = "spaceremit-js";
const SPACEREMIT_SCRIPT_SRC = "https://spaceremit.com/api/v2/js_script/spaceremit.js";

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["السعودية", "الإمارات"]);
  const [fileName, setFileName] = useState("");
  const [email, setEmail] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentState, setPaymentState] = useState<"idle" | "verifying" | "success" | "error">("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const remaining = useMemo(() => 5 - selected.length, [selected.length]);
  const publicKey = process.env.NEXT_PUBLIC_SPACEREMIT_PUBLIC_KEY || "";

  function toggleCountry(country: string) {
    setSelected((current) => {
      if (current.includes(country)) return current.filter((item) => item !== country);
      if (current.length >= 5) return current;
      return [...current, country];
    });
  }

  useEffect(() => {
    if (!paymentOpen || !publicKey) return;

    const w = window as typeof window & Record<string, unknown>;
    w.SP_PUBLIC_KEY = publicKey;
    w.SP_FORM_ID = "#spaceremit-form";
    w.SP_SELECT_RADIO_NAME = "sp-pay-type-radio";
    w.LOCAL_METHODS_BOX_STATUS = true;
    w.LOCAL_METHODS_PARENT_ID = "#spaceremit-local-methods-pay";
    w.CARD_BOX_STATUS = true;
    w.CARD_BOX_PARENT_ID = "#spaceremit-card-pay";
    w.SP_FORM_AUTO_SUBMIT_WHEN_GET_CODE = false;

    w.SP_RECIVED_MESSAGE = (message: unknown) => {
      setPaymentState("error");
      setPaymentMessage(typeof message === "string" ? message : "تعذر إتمام عملية الدفع.");
    };
    w.SP_FAILD_PAYMENT = () => {
      setPaymentState("error");
      setPaymentMessage("عملية الدفع لم تكتمل. حاول مرة أخرى.");
    };
    w.SP_NEED_AUTH = (targetAuthLink: unknown) => {
      if (typeof targetAuthLink === "string" && targetAuthLink.startsWith("https://")) {
        window.location.href = targetAuthLink;
      }
    };
    w.SP_SUCCESSFUL_PAYMENT = async (spaceremitCode: unknown) => {
      if (typeof spaceremitCode !== "string") return;
      setPaymentState("verifying");
      setPaymentMessage("بنتأكد من عملية الدفع...");
      try {
        const response = await fetch("/api/spaceremit/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId: spaceremitCode }),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "Verification failed");
        setPaymentState("success");
        setPaymentMessage(result.test ? "تمت عملية الاختبار بنجاح. Spaceremit مربوط صح." : "تم تأكيد الدفع بنجاح.");
      } catch {
        setPaymentState("error");
        setPaymentMessage("وصل الدفع لكن تعذر التحقق منه. لم يتم تفعيل الطلب.");
      }
    };

    const existing = document.getElementById(SPACEREMIT_SCRIPT_ID);
    if (existing) return;

    const script = document.createElement("script");
    script.id = SPACEREMIT_SCRIPT_ID;
    script.src = SPACEREMIT_SCRIPT_SRC;
    script.async = true;
    script.onerror = () => {
      setPaymentState("error");
      setPaymentMessage("تعذر تحميل بوابة الدفع. حاول مرة أخرى.");
    };
    document.body.appendChild(script);
  }, [paymentOpen, publicKey]);

  return (
    <main>
      <nav className="nav shell"><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><span className="navBadge">AI Job Hunter</span></nav>
      <section className="hero shell">
        <div className="heroCopy"><span className="eyebrow">بدل ما تدوّر بالساعات</span><h1>ارفع الـCV.<br />اختار الدول.<br /><span>وسيبلنا البحث.</span></h1><p>نحلل خبرتك، ندور على فرص مناسبة في الدول اللي تختارها، ونبعتلك أقوى النتائج على الإيميل.</p><div className="trustRow"><span>✓ بدون اشتراك</span><span>✓ بحث مخصص</span><span>✓ 69 جنيه فقط</span></div></div>
        <div className="card">
          <div className="step"><span>1</span><div><strong>ارفع الـCV</strong><small>PDF أو DOCX — لحد 10MB</small></div></div>
          <label className="upload"><input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setFileName(e.target.files?.[0]?.name || "")} /><b>{fileName || "اضغط لرفع ملفك"}</b><small>{fileName ? "تم اختيار الملف" : "هنستخدمه عشان نفهم خبرتك ومهاراتك"}</small></label>
          <div className="step"><span>2</span><div><strong>فين حابب تشتغل؟</strong><small>اختار لحد 5 دول</small></div></div>
          <div className="chips">{countries.map((country) => <button key={country} type="button" className={selected.includes(country) ? "chip active" : "chip"} onClick={() => toggleCountry(country)}>{country}</button>)}</div>
          <small className="remaining">متبقي {remaining} اختيارات</small>
          <div className="fields"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="إيميلك لاستلام الفرص" /><select defaultValue="no"><option value="no">لا أحتاج Visa Sponsorship</option><option value="yes">أحتاج Visa Sponsorship</option><option value="unsure">مش متأكد</option></select></div>
          <button className="cta" type="button" onClick={() => { setPaymentState("idle"); setPaymentMessage(""); setPaymentOpen(true); }}>ابدأ البحث بـ 69 جنيه</button>
          <p className="fine">الدفع يتم بشكل آمن. مش هنبعت الـCV لأي شركة بدون إذنك.</p>
        </div>
      </section>
      <section className="how shell"><p className="sectionKicker">إزاي Jobalak بيشتغل؟</p><div className="grid3"><article><b>01</b><h3>نفهم الـCV</h3><p>نستخرج خبرتك، مهاراتك، مستوى الوظائف المناسب ليك، ونقاط القوة.</p></article><article><b>02</b><h3>ندور بدل منك</h3><p>نفلتر فرص حقيقية حسب الدول اللي اخترتها ومتطلبات كل وظيفة.</p></article><article><b>03</b><h3>نوصلهالك</h3><p>تستلم أفضل الفرص على الإيميل مع نسبة التوافق ورابط التقديم الرسمي.</p></article></div></section>
      <footer className="shell footer"><div><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><p>الجوب المناسب.. لحد عندك.</p></div><div className="footerLinks"><Link href="/about">من نحن</Link><Link href="/jobs">الوظائف</Link><Link href="/faq">الأسئلة الشائعة</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/privacy">الخصوصية</Link></div></footer>
      {paymentOpen && <div className="modalBackdrop" onClick={() => setPaymentOpen(false)}><section className="paymentModal spaceremitModal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setPaymentOpen(false)}>×</button><span className="paymentIcon">✓</span><p className="sectionKicker">خطوة أخيرة ونبدأ البحث</p><h2>إتمام الدفع</h2><p className="muted">بحث مخصص عن الوظائف المناسبة لخبرتك في الدول اللي اخترتها.</p><div className="orderRow"><span>Jobalak Job Search</span><strong>69 EGP</strong></div>{!publicKey ? <div className="paymentNotice error">بوابة الدفع غير مهيأة على السيرفر.</div> : <form id="spaceremit-form" className="spaceremitForm"><input type="hidden" name="amount" value="69" readOnly /><input type="hidden" name="currency" value="EGP" readOnly /><input type="hidden" name="fullname" value="Jobalak Customer" readOnly /><input type="hidden" name="email" value={email} readOnly /><input type="hidden" name="phone" value="" readOnly /><input type="hidden" name="notes" value={`Jobalak 69 EGP | ${selected.join(", ")}`} readOnly /><div className="spOneTypeSelect"><input type="radio" name="sp-pay-type-radio" value="local-methods-pay" id="sp_local_methods_radio" defaultChecked /><label htmlFor="sp_local_methods_radio">طرق الدفع المحلية</label><div id="spaceremit-local-methods-pay" /></div><div className="spOneTypeSelect"><input type="radio" name="sp-pay-type-radio" value="card-pay" id="sp_card_radio" /><label htmlFor="sp_card_radio">Visa / Mastercard</label><div id="spaceremit-card-pay" /></div><button className="cta" type="submit" disabled={paymentState === "verifying"}>{paymentState === "verifying" ? "جاري التحقق..." : "ادفع 69 جنيه"}</button></form>}{paymentMessage && <div className={`paymentNotice ${paymentState}`}>{paymentMessage}</div>}<p className="fine">بيئة اختبار Spaceremit مفعلة حاليًا. لن نفعّل أي طلب إلا بعد تحقق السيرفر من العملية.</p></section></div>}
    </main>
  );
}
