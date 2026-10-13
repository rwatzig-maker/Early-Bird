import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

const siteUrl = "https://www.earlybirdchildcarellc.com";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Early Bird Child Care | Bilingual Daycare in Sandy, OR",
  description: "Now enrolling infants, toddlers, and preschoolers in Sandy, Oregon. Early Bird offers bilingual English-Spanish certified family child care, home-prepared meals, outdoor play, and care from 5:30 AM.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Early Bird Child Care — Sandy, Oregon",
    description: "A loving, bilingual family childcare program in Sandy. Meet Letty, explore the playground, and schedule a visit.",
    url: siteUrl,
    siteName: "Early Bird Child Care",
    type: "website",
    locale: "en_US",
    images: [{ url: "/gallery/IMG_3669.webp", alt: "Early Bird Child Care outdoor playground" }]
  },
  robots: { index: true, follow: true }
};

const childcare = {
  "@context": "https://schema.org",
  "@type": "ChildCare",
  name: "Early Bird Child Care LLC",
  url: siteUrl,
  telephone: "+1-503-421-0600",
  image: `${siteUrl}/gallery/IMG_3669.webp`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "41361 SE Vista Loop Dr",
    addressLocality: "Sandy",
    addressRegion: "OR",
    postalCode: "97055",
    addressCountry: "US"
  },
  openingHoursSpecification: [{
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"],
    opens: "05:30",
    closes: "18:00"
  }],
  knowsLanguage: ["en","es"],
  areaServed: { "@type": "Place", name: "Sandy, Oregon" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  return (
    <html lang="en">
      <body>
        {gaId && <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />}
        {gaId && <Script id="early-bird-ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}</Script>}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(childcare).replace(/</g,"\\u003c") }} />
        {children}
      </body>
    </html>
  );
}
