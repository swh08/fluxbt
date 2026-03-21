import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { I18nProvider } from "@/contexts/i18n-context";
import { BackgroundProvider } from "@/contexts/background-context";
import { BackgroundImage } from "@/components/background/background-image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FluxBT - Torrent Manager",
  description: "Professional torrent management dashboard with real-time monitoring and control.",
  keywords: ["Torrent", "Download Manager", "P2P", "BitTorrent", "Dashboard"],
  authors: [{ name: "FluxBT Team" }],
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" }
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <BackgroundProvider>
              <BackgroundImage />
              <div className="relative z-10">
                {children}
                <Toaster />
              </div>
            </BackgroundProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
