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
  mono = false,
  className,
}: {
  variant?: keyof typeof VARIANTS;
  /** Draw the single-colour traced logo in the current text colour instead of the supplied artwork. */
  mono?: boolean;
  className?: string;
}) {
  const { file, ratio } = VARIANTS[variant];
  if (!mono) {
    // Supplied artwork: a light-mode and a dark-mode version, swapped by theme.
    return (
      <span role="img" aria-label="慈雷宮 temple logo" className={clsx('inline-flex flex-shrink-0', className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-light.png" alt="" className="block h-full w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo-dark.png" alt="" className="hidden h-full w-auto dark:block" />
      </span>
    );
  }
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
