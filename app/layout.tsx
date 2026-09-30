import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/data";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "IT Kids — o'quv platformasi",
  description: "6 oylik IT Kids kursi: dars materiallari, interaktiv ko'rgazmalar va testlar",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        <AuthProvider>
          <Header />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
