import Link from 'next/link';
import { TopBar } from '@/components/layout/TopBar';
import { TermsContent } from '@/components/terms/TermsContent';

export const metadata = {
  title: 'Terms & Conditions · QueueDesk',
  description: 'The terms for taking a queue token at the temple.',
};

export default function TermsPage() {
  return (
    <main className="flex-1">
      <TopBar />
      <div className="mx-auto max-w-[760px] px-4 pb-16 pt-6 sm:px-5">
        <article className="rounded-card border border-line bg-card p-5 shadow-card sm:p-8">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-coral-dark">Queue token</p>
          <h1 className="mt-2 text-[1.5rem] font-bold leading-tight text-violet-dark sm:text-[1.875rem]">
            Terms &amp; Conditions
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Please read these before you take a queue token. By ticking the box on the token form you agree to them.
          </p>
          <div className="mt-6">
            <TermsContent />
          </div>
          <Link href="/" className="mt-8 inline-flex min-h-11 items-center text-sm font-bold text-violet">
            ← Back to get a token
          </Link>
        </article>
      </div>
    </main>
  );
}
