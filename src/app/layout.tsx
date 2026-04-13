import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full flex flex-col">
        <Providers>
          <RoleAwareNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
