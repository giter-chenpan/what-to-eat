import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./povider";

export const metadata: Metadata = {
  title: "what to eat",
  description: "what to eat",
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
