import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarkItDown Converter",
  description: "Convert documents to editable Markdown with live preview.",
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
