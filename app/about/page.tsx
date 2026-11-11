import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';

export const metadata = {
  title: 'About & Contact · QueueDesk',
  description: 'About Ci Lei Gong Ltd, and how to contact us.',
};

const ORG = {
  name: 'Ci Lei Gong Ltd',
  uen: '202557151C',
  addressLines: ['50 Gambas Cresent,', '10-44B (Upper Deck),', 'Proxima@Gambas,', 'Singapore 757022'],
  phone: '+65 8257 9388',
  phoneHref: '+6582579388',
  email: 'Cileigong@gmail.com',
};

const ROW = 'grid gap-0.5 sm:grid-cols-[9rem_1fr] sm:items-baseline sm:gap-4';
const LABEL = 'text-[12px] font-bold uppercase tracking-[0.1em] text-coral-dark';
const VALUE = 'text-[15px] leading-6 text-ink';
const LINK =
  'font-bold text-violet underline underline-offset-2 hover:text-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber';

export default function AboutPage() {
  return (
    <main className="flex-1">
      <TopBar />
      <div className="mx-auto max-w-[760px] px-4 pb-16 pt-6 sm:px-5">
        <article className="rounded-card border border-line bg-card p-5 shadow-card sm:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-coral-dark">About us</p>
          <h1 className="mt-2 text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
            {ORG.name}
          </h1>
          <p className="cn mt-1 text-[1.125rem] text-amber-dark" aria-hidden="true">
            慈雷宮
          </p>

          <section className="mt-6">
            <h2 className="text-[1.0625rem] font-bold text-violet-dark">What QueueDesk is</h2>
            <p className="mt-2 text-sm leading-6 text-ink">
              QueueDesk is the queue and events service run by {ORG.name}. Visitors can take a queue token from their
              phone, watch the live &ldquo;Now serving&rdquo; board and see upcoming temple events, so there is no need
              to wait in a line.
            </p>
            <p className="mt-2 text-sm leading-6 text-ink">
              We use a visitor&rsquo;s name and mobile number only to run the queue, for example to verify the number
              and to let them know when their turn is near. Please see our{' '}
              <Link href="/terms" className={LINK}>
                Terms &amp; Conditions
              </Link>{' '}
              for details.
            </p>
          </section>

          <section className="mt-8">
            <h2 className="text-[1.0625rem] font-bold text-violet-dark">Contact us</h2>
            <dl className="mt-3 grid gap-4 rounded-xl border border-line p-4">
              <div className={ROW}>
                <dt className={LABEL}>Organisation</dt>
                <dd className={VALUE}>{ORG.name}</dd>
              </div>
              <div className={ROW}>
                <dt className={LABEL}>UEN</dt>
                <dd className={VALUE}>{ORG.uen}</dd>
              </div>
              <div className={ROW}>
                <dt className={LABEL}>Address</dt>
                <dd className={VALUE}>
                  <address className="not-italic">
                    {ORG.addressLines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </dd>
              </div>
              <div className={ROW}>
                <dt className={LABEL}>Phone</dt>
                <dd className={VALUE}>
                  <a href={`tel:${ORG.phoneHref}`} className={LINK}>
                    {ORG.phone}
                  </a>
                </dd>
              </div>
              <div className={ROW}>
                <dt className={LABEL}>Email</dt>
                <dd className={VALUE}>
                  <a href={`mailto:${ORG.email}`} className={LINK}>
                    {ORG.email}
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-8" aria-labelledby="donation-heading">
            <h2 id="donation-heading" className="text-[1.0625rem] font-bold text-violet-dark">
              Donation
            </h2>

            <div className="mt-3 rounded-xl border border-line p-4 sm:p-6">
              <h3 className="text-center text-[1.0625rem] font-bold leading-snug text-violet-dark">
                Supporting the Temple and Preserving the Tradition
              </h3>
              <p className="mx-auto mt-3 max-w-[56ch] text-center text-sm leading-6 text-ink">
                Your financial contribution &mdash; traditionally offered as &ldquo;incense oil support&rdquo;{' '}
                <span className="cn">(香油/填油)</span> &mdash; directly sustains the daily rituals, upkeep of the temple
                grounds, and our community programs.
              </p>

              <dl className="mt-5 grid gap-4 border-t border-line pt-5">
                <div className={ROW}>
                  <dt className={LABEL}>Temple Sustaining Offering</dt>
                  <dd className={VALUE}>Helps maintain the shrine, deity offerings, and ritual spaces.</dd>
                </div>
                <div className={ROW}>
                  <dt className={LABEL}>Festival &amp; Ritual Sponsorship</dt>
                  <dd className={VALUE}>Supports upcoming celebrations, offerings, and ceremonial rites.</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-col items-center gap-4 border-t border-line pt-6">
                <a
                  href="#paynow-qr"
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-violet px-5 text-center text-sm font-bold text-white transition-colors hover:bg-violet-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:w-auto"
                >
                  Make an Offering / Contribute
                </a>

                <figure id="paynow-qr" className="scroll-mt-24 rounded-xl border border-line bg-white p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/paynow-qr.jpeg"
                    alt={`PayNow QR code for ${ORG.name}`}
                    width={220}
                    height={220}
                    className="mx-auto h-[220px] w-[220px] max-w-full"
                  />
                  <figcaption className="mt-2 text-center text-[12px] leading-5 text-muted">
                    PayNow &middot; {ORG.name}
                    <br />
                    UEN {ORG.uen}
                  </figcaption>
                </figure>

                <p className="max-w-[48ch] text-center text-sm italic leading-6 text-muted">
                  With deep gratitude for your support in keeping the light of the tradition burning.
                </p>
              </div>
            </div>
          </section>

          <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-violet">
            ← Back to get a token
          </Link>
        </article>
      </div>
    </main>
  );
}
