import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobalak | سيب البحث علينا",
  description: "ارفع الـCV، اختار الدول، وسيب Jobalak يدورلك على أنسب فرص العمل ويرسلهالك على الإيميل.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
