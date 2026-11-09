import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AugenFacharzt – Mündliche Prüfung",
  description:
    "Private Lernplattform zur Vorbereitung auf die mündliche Facharztprüfung Augenheilkunde.",
  icons: {
    icon: "/branding/daog-eye-mark.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("af_theme")?.value;
  const theme = cookieTheme === "auros" ? "auros" : cookieTheme === "discord" ? "discord" : "cursor";

  return (
    <html
      lang="de"
      data-theme={theme}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
