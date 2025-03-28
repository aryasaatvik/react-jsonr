import './global.css';
import { RootProvider } from 'fumadocs-ui/provider';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'React JSONR',
  description: 'A powerful, extensible library for building dynamic UI from declarative definitions.',
  openGraph: {
    title: 'React JSONR',
    description: 'A powerful, extensible library for building dynamic UI from declarative definitions.',
    url: 'https://jsonr.arya.sh',
    siteName: 'React JSONR',
    images: [
      {
        url: 'https://jsonr.arya.sh/og.png',
      },
    ],
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
