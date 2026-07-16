'use client';

// app/layout.jsx (or the specific page it should appear on)
import LogoIntro from '@/components/LogoIntro';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LogoIntro />
        {children}
      </body>
    </html>
  );
}