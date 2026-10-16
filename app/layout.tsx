import type { Metadata } from 'next';
import { Manrope, Noto_Serif, Noto_Serif_Devanagari } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { SiteFooter } from '@/components/layout/SiteFooter';

// Headings.
const notoSerif = Noto_Serif({
  subsets: ['latin'],
  weight: ['600', '700', '900'],
  variable: '--font-noto-serif',
  display: 'swap',
});

// Decorative Devanagari lettering (seal, small Hindi labels).
const notoDeva = Noto_Serif_Devanagari({
  subsets: ['devanagari', 'latin'],
  weight: ['600', '700'],
  variable: '--font-deva',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'QueueDesk · Temple Queue',
  description: 'Temple queue and events: get a token, watch the board, register for festivals',
};

// Applies the saved/system theme before first paint, so there's no
// light-mode flash for users who prefer dark (or vice versa).
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('qd-theme');
    var isDark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${notoSerif.variable} ${notoDeva.variable} ${manrope.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <ToastProvider>
          {children}
          <SiteFooter />
        </ToastProvider>
      </body>
    </html>
  );
}
