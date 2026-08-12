import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "/alternate | Premium Bio-Link & Profile Platform",
  description: "Create highly customizable personal profiles containing links, socials, music, Discord/Roblox presence, custom widgets, badges, and visual effects.",
  metadataBase: new URL("https://alternate.lol"),
  openGraph: {
    title: "/alternate | Premium Bio-Link Platform",
    description: "Create highly customizable personal profiles containing links, socials, music, Discord/Roblox presence, custom widgets, badges, and visual effects.",
    type: "website",
    url: "https://alternate.lol",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
