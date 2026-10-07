import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Early Bird Child Care | Sandy, Oregon",
  description: "Early Bird Child Care in Sandy, Oregon.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
