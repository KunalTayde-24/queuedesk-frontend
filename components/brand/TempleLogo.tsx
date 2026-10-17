import clsx from 'clsx';

// Aspect ratios of the traced SVGs in /public/images (width / height).
const VARIANTS = {
  full: { file: '/images/logo-full.svg', ratio: '3948 / 2842' },
  emblem: { file: '/images/logo-emblem.svg', ratio: '1243 / 1238' },
  wordmark: { file: '/images/logo-wordmark.svg', ratio: '3948 / 1381' },
} as const;

/**
 * The temple logo (lotus emblem + 慈雷宮). It is drawn as a CSS mask over the
 * current text colour, so it stays razor sharp at any size and flips colour
 * with the theme: set the size with a height class (e.g. `h-11`) and the colour
 * with a text colour class.
 */
export function TempleLogo({
  variant = 'full',
  className,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const { file, ratio } = VARIANTS[variant];
  return (
    <span
      role="img"
      aria-label="慈雷宮 temple logo"
      className={clsx('inline-block flex-shrink-0 bg-current text-[#3C1916] dark:text-ink', className)}
      style={{
        aspectRatio: ratio,
        WebkitMaskImage: `url(${file})`,
        maskImage: `url(${file})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  );
}
