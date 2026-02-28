import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EMBA Wrapped '26",
  description: "UGA Terry College of Business Network Wrapped",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans bg-zinc-950 text-zinc-100">
        {children}
      </body>
    </html>
  );
}