import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/layout/providers";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.zelo.com.br";

export const metadata: Metadata = {
  title: {
    default: "Zelo Clinic",
    template: "%s | Zelo Clinic",
  },
  description: "Painel de Gestão da Clínica — Gerencie pacientes, cuidadores, turnos e checklists.",
  metadataBase: new URL(appUrl),
  applicationName: "Zelo Clinic",
  authors: [{ name: "Zelo" }],
  generator: "Next.js",
  keywords: ["clínica", "gestão", "cuidados", "pacientes", "saúde"],
  referrer: "origin-when-cross-origin",
  creator: "Zelo",
  publisher: "Zelo",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Zelo Clinic",
    title: "Zelo Clinic",
    description:
      "Painel de Gestão da Clínica — Gerencie pacientes, cuidadores, turnos e checklists.",
  },
  twitter: {
    card: "summary",
    title: "Zelo Clinic",
    description:
      "Painel de Gestão da Clínica — Gerencie pacientes, cuidadores, turnos e checklists.",
  },
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light dark",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn("h-full font-sans antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
