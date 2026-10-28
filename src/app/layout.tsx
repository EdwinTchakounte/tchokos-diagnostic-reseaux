import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "./fonts/Poppins-SemiBold.ttf", weight: "600", style: "normal" },
    { path: "./fonts/Poppins-ExtraBold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tchokos × Zayra Technologies — Votre audience est énorme. Faisons-la vendre.",
  description: "Maquette de présentation privée : gestion du marketing digital de Tchokos SARL par Zayra Technologies.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "Tchokos × Zayra — Votre audience est énorme. Faisons-la vendre.",
    description: "Le diagnostic du marketing digital de Tchokos SARL, et notre plan pour le faire vendre.",
    images: [{ url: "/og-tchokos.png", width: 1200, height: 630 }],
    locale: "fr_FR",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${poppins.variable} antialiased`}>
      <body>{children}</body>
    </html>
  );
}
