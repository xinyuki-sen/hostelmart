import type { Metadata } from 'next';
import '@/styles/globals.css';
import '@/styles/chrono-theme.css';
import '@/styles/olx-components.css';

export const metadata: Metadata = {
  title: 'HostelMart — Hyper-Local Campus Marketplace',
  description: 'Hand-to-hand student marketplace for hostel essentials, textbooks, appliances, and bicycles with zero shipping.',
  keywords: ['hostel marketplace', 'college buy and sell', 'used textbooks', 'student essentials', 'hostelmart'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
