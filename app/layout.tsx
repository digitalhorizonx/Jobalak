import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jobalak | سيب البحث علينا",
  description: "ارفع الـCV، اختار الدول، وسيب Jobalak يدورلك على أنسب فرص العمل ويرسلهالك على الإيميل.",
  other: {
    "spaceremit-verification": "3SIUOWGXWYCJL9HRB09712N70USF6ZMTQ9M9LN6KAHNLASCCGA",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
