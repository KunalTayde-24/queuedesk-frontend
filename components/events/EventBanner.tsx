import clsx from 'clsx';
import { useId } from 'react';
import { eventDayMonth } from '@/lib/event-time';

// Warm temple palettes: saffron, maroon, indigo, temple-teal, plum.
const PALETTES: [string, string][] = [
  ['#B4410B', '#F2A33A'],
  ['#7A1A1E', '#D9412E'],
  ['#2B2F6B', '#6B6FD0'],
  ['#14595A', '#3DB59A'],
  ['#4A2A7A', '#B467C9'],
];

function hash(seed: string) {
  return [...seed].reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
}

/** Artwork shown when an event has no uploaded image: a gopuram against a glowing sky. */
function EventArt({ seed }: { seed: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const h = hash(seed || 'event');
  const [a, b] = PALETTES[h % PALETTES.length] as [string, string];
  const sunX = 70 + (h % 5) * 65;
  return (
    <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <radialGradient id={`${uid}-glow`}>
          <stop offset="0" stopColor="#FFE9B0" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFE9B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="225" fill={`url(#${uid}-sky)`} />
      <circle cx={sunX} cy="84" r="70" fill={`url(#${uid}-glow)`} />
      <circle cx={sunX} cy="84" r="24" fill="#FFE9B0" opacity=".95" />
      {/* faint rangoli dots */}
      <g fill="#fff" opacity=".18">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <circle key={i} cx={24 + i * 52} cy={22 + (i % 2) * 10} r="2.2" />
        ))}
      </g>
      {/* gopuram silhouette */}
      <g fill="#1B0A0A" opacity=".72">
        <rect x="0" y="190" width="400" height="35" />
        <path d="M120 190h160v-26H120z" />
        <path d="M132 164h136v-22H132z" />
        <path d="M146 142h108v-20H146z" />
        <path d="M160 122h80v-18h-80z" />
        <path d="M174 104h52V88h-52z" />
        <path d="M186 88h28V74h-28z" />
        <ellipse cx="200" cy="68" rx="11" ry="8" />
        <path d="M200 60v-9" stroke="#1B0A0A" strokeWidth="2.5" />
        <path d="M60 190v-30h40v30zM300 190v-30h40v30z" />
        <ellipse cx="80" cy="156" rx="12" ry="9" />
        <ellipse cx="320" cy="156" rx="12" ry="9" />
      </g>
      {/* lit doorway and windows */}
      <g fill="#FFD27A" opacity=".9">
        <path d="M188 190v-20a12 12 0 0 1 24 0v20z" />
        <rect x="150" y="170" width="8" height="10" rx="1" />
        <rect x="242" y="170" width="8" height="10" rx="1" />
        <rect x="164" y="148" width="7" height="9" rx="1" />
        <rect x="229" y="148" width="7" height="9" rx="1" />
      </g>
    </svg>
  );
}

export function EventBanner({
  src,
  alt,
  fill = false,
  seed = '',
  startsAt,
}: {
  src: string | null;
  alt: string;
  fill?: boolean;
  /** Varies the generated artwork per event (use the event id or title). */
  seed?: string;
  /** Shows a date seal in the corner when provided. */
  startsAt?: string;
}) {
  const seal = startsAt ? eventDayMonth(startsAt) : null;
  return (
    <div
      className={clsx(
        'relative w-full overflow-hidden bg-violet',
        fill ? 'aspect-[16/9] md:aspect-auto md:h-full md:min-h-[240px]' : 'aspect-[16/9]',
      )}
    >
      {src ? (
        // Event banners are stored on our own API, so a plain image keeps the crop predictable.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <EventArt seed={seed} />
      )}
      {seal && (
        <span
          aria-hidden="true"
          className="absolute bottom-0 right-3 rounded-t-xl border border-b-0 border-line bg-card px-3 pb-1 pt-1.5 text-center shadow-sm"
        >
          <b className="block font-serif text-[20px] font-black leading-none text-violet">{seal.day}</b>
          <small className="block text-[10px] font-extrabold uppercase tracking-wide text-muted">{seal.month}</small>
        </span>
      )}
    </div>
  );
}
