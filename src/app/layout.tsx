import type { Metadata } from "next";
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
  title: "RentEase — Find Your Perfect Rental Home",
  description:
    "India's smartest rental platform. Browse properties, book instantly, and manage everything from one dashboard.",
};

import { Providers } from "@/components/providers/session-provider";
import RoleAwareNavbar from "@/components/Layout/role-aware-navbar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <RoleAwareNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
