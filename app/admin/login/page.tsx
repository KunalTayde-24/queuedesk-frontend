'use client';

import { TempleLogo } from '@/components/brand/TempleLogo';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api-client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await apiClient.login({ email, password });
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex-1">
      <TopBar />
      <div className="mx-auto max-w-[1080px] px-4 pb-14 pt-3 sm:px-5">
        <section className="grid overflow-hidden rounded-[24px] border border-line bg-card shadow-lg md:grid-cols-2">
          <div
            role="img"
            aria-label="Temple with red lanterns"
            className="temple-photo relative min-h-[190px] [background-position:65%_30%] md:min-h-[420px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[linear-gradient(0deg,rgba(18,6,3,0.55),transparent_55%)]"
            />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col justify-center gap-3.5 p-6 sm:p-9">
            <TempleLogo className="mb-1 h-16 self-start" />
            <span className="eyebrow">
              <span className="cn" aria-hidden="true">
                管理
              </span>
              Staff only
            </span>
            <div>
              <h1 className="text-[24px] font-bold text-ink">Admin sign in</h1>
              <p className="mt-1 text-[13px] text-muted">Manage today&apos;s queue and temple events.</p>
            </div>
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@temple.org"
              autoComplete="username"
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoComplete="current-password"
              required
            />
            {error && (
              <p role="alert" className="text-[12.5px] font-semibold leading-5 text-coral-dark">
                {error}
              </p>
            )}
            <Button type="submit" disabled={submitting} className="min-h-11 w-full text-[14px]">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
