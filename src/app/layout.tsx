import type { Metadata } from "next";
import { Poppins, PT_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { cn } from "@/lib/utils";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-headline",
  weight: ["400", "600", "700"],
});

const ptSans = PT_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "MICONDO APP",
  description: "Gestión de condominios de clase mundial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          poppins.variable,
          ptSans.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
