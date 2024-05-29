import type { Metadata } from "next";
import "antd/dist/reset.css";

export const metadata: Metadata = {
  title: "ACARS Managenent Center",
  description: "ACARS Managenent Center",
  icons: "/favicon.svg",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
