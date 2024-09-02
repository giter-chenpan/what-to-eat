import type { Metadata } from "next";
import "./globals.css";
import Providers from "./povider";

export const metadata: Metadata = {
  title: "what to eat",
  description: "what to eat",
};

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
