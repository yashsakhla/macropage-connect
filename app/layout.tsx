import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Macropage Connect — WhatsApp Business API Platform for India",
  description:
    "Official WhatsApp Business API solution for Indian businesses. Automate conversations, run broadcast campaigns, manage a team inbox, and grow revenue on WhatsApp.",
  keywords: "WhatsApp Business API India, WhatsApp marketing platform, WhatsApp automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
