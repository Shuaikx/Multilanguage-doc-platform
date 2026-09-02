import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Parallel Docs',
  description: 'A local workspace for comparing Chinese, Korean, and English documentation.',
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
