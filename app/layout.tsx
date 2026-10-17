import type { Metadata } from 'next';
import { Ma_Shan_Zheng, Manrope, Noto_Serif_SC } from 'next/font/google';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { SiteFooter } from '@/components/layout/SiteFooter';

// Headings: Noto Serif SC covers Latin + Chinese. The CJK glyph files are large,
// so they are fetched on demand (unicode-range) instead of preloaded.
const notoSerif = Noto_Serif_SC({
  weight: ['600', '700', '900'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: false,
});

// Calligraphic lettering for the seal, banners and small Chinese labels.
const maShan = Ma_Shan_Zheng({
  weight: '400',
  variable: '--font-ma-shan',
  display: 'swap',
  preload: false,
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
      className={`${notoSerif.variable} ${maShan.variable} ${manrope.variable}`}
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
