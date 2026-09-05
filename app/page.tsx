"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const countries = ["مصر", "السعودية", "الإمارات", "قطر", "الكويت", "الأردن", "ألمانيا", "هولندا", "المملكة المتحدة", "كندا", "أستراليا", "Remote"];

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["السعودية", "الإمارات"]);
  const [fileName, setFileName] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const remaining = useMemo(() => 5 - selected.length, [selected.length]);

  function toggleCountry(country: string) {
    setSelected((current) => {
      if (current.includes(country)) return current.filter((item) => item !== country);
      if (current.length >= 5) return current;
      return [...current, country];
    });
  }

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
          <div className="fields"><input type="email" placeholder="إيميلك لاستلام الفرص" /><select defaultValue="no"><option value="no">لا أحتاج Visa Sponsorship</option><option value="yes">أحتاج Visa Sponsorship</option><option value="unsure">مش متأكد</option></select></div>
          <button className="cta" type="button" onClick={() => setPaymentOpen(true)}>ابدأ البحث بـ 69 جنيه</button>
          <p className="fine">الدفع يتم بشكل آمن. مش هنبعت الـCV لأي شركة بدون إذنك.</p>
        </div>
      </section>
      <section className="how shell"><p className="sectionKicker">إزاي Jobalak بيشتغل؟</p><div className="grid3"><article><b>01</b><h3>نفهم الـCV</h3><p>نستخرج خبرتك، مهاراتك، مستوى الوظائف المناسب ليك، ونقاط القوة.</p></article><article><b>02</b><h3>ندور بدل منك</h3><p>نفلتر فرص حقيقية حسب الدول اللي اخترتها ومتطلبات كل وظيفة.</p></article><article><b>03</b><h3>نوصلهالك</h3><p>تستلم أفضل الفرص على الإيميل مع نسبة التوافق ورابط التقديم الرسمي.</p></article></div></section>
      <footer className="shell footer"><div><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><p>الجوب المناسب.. لحد عندك.</p></div><div className="footerLinks"><Link href="/about">من نحن</Link><Link href="/jobs">الوظائف</Link><Link href="/faq">الأسئلة الشائعة</Link><Link href="/terms">الشروط والأحكام</Link><Link href="/privacy">الخصوصية</Link></div></footer>
      {paymentOpen && <div className="modalBackdrop" onClick={() => setPaymentOpen(false)}><section className="paymentModal" onClick={(e) => e.stopPropagation()}><button className="close" onClick={() => setPaymentOpen(false)}>×</button><span className="paymentIcon">✓</span><p className="sectionKicker">خطوة أخيرة ونبدأ البحث</p><h2>إتمام الدفع</h2><p className="muted">بحث مخصص عن الوظائف المناسبة لخبرتك في الدول اللي اخترتها.</p><div className="orderRow"><span>Jobalak Job Search</span><strong>69 EGP</strong></div><button className="walletChoice" type="button"><span><b>Vodafone Cash</b><small>تحويل مباشر للمحفظة</small></span><strong>الأسرع</strong></button><div className="walletPlaceholder"><small>رقم محفظة Jobalak</small><b>سيتم تفعيل الرقم قريبًا</b><p>بعد التحويل هتدخل رقم الموبايل اللي حولت منه وترفع صورة التحويل للتأكيد.</p></div><button className="cta disabled" type="button" disabled>تأكيد الدفع — قريبًا</button><p className="fine">هذه معاينة لتجربة الدفع. لن يتم خصم أي مبلغ حاليًا.</p></section></div>}
    </main>
  );
}
