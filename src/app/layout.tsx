import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Lora } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Aksara — Berita, Artikel & Cerpen",
    template: "%s | Aksara",
  },
  description:
    "Platform publikasi digital minimalis untuk berita aktual, artikel informatif, dan karya fiksi seperti cerpen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${lora.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
