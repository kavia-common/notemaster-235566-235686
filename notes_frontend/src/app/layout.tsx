import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Notemaster",
  description: "Retro-themed notes app (CRUD, tags, pinning, search).",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
