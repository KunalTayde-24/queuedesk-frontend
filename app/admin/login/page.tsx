'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/Card';
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
    <main className="min-h-screen">
      <TopBar />
      <div className="flex justify-center px-5 py-12 sm:py-16">
        <Card accent="pink" className="w-full max-w-[340px]">
          <div className="mb-3.5 flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-violet-light text-violet">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="4" y="10" width="16" height="10" rx="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            </svg>
          </div>
          <h2 className="mb-1 text-[19px] text-violet-dark">Admin login</h2>
          <p className="mb-5 text-[12.5px] text-muted">Sign in to manage today&apos;s queue.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@queuedesk.com"
              required
            />
            <Input
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
            {error && <p className="text-[11.5px] text-coral-dark">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
