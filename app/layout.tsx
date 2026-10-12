import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Early Bird Child Care | Sandy, Oregon",
  description: "Early Bird Child Care in Sandy, Oregon. Bilingual English-Spanish certified family childcare, 25 years of experience, home-prepared meals, early hours, and weekend care by arrangement. Now enrolling infants, toddlers and preschoolers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
