import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <main>
      <nav className="nav shell"><Link href="/" className="brand"><span className="brandDot" />Jobalak</Link><span className="navBadge">AI Job Hunter</span></nav>
      <section className="pageHero shell">
        <span className="eyebrow">تم الرجوع من PayPal</span>
        <h1>استلمنا رجوعك من الدفع.</h1>
        <p>هنأكد عملية الدفع قبل تفعيل محاولة البحث. الرجوع للصفحة دي لوحده مش إثبات دفع، وده لحماية طلبك وحسابنا.</p>
        <div className="infoCard" style={{ marginTop: 24 }}>
          <h2>الخطوة التالية</h2>
          <p>بعد إضافة التحقق الآمن من PayPal، أي عملية دفع مؤكدة هتفعّل محاولة البحث تلقائيًا.</p>
          <Link className="cta" style={{ display: "block", textAlign: "center" }} href="/">الرجوع لـ Jobalak</Link>
        </div>
      </section>
    </main>
  );
}
