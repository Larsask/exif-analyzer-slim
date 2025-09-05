import type { Metadata } from 'next';
import { Play } from 'next/font/google';
import './globals.css';

const play = Play({ subsets: ['latin'], variable: '--font-play', weight: ['400', '700'] });

export const metadata: Metadata = {
  title: 'EXIF Analyzer',
  description: 'Upload and analyze images with ExifTool and friends',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${play.variable} dark antialiased`}>{children}</body>
    </html>
  );
}
