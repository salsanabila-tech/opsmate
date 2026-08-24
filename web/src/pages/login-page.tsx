import { useState, type FormEvent } from 'react';

import { Navigate, useNavigate } from 'react-router-dom';

import { LoaderCircle, LockKeyhole } from 'lucide-react';

import { useAuth } from '../context/auth-context';

export function LoginPage() {
  const { signIn, status } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (status === 'authenticated') {
    return <Navigate to="/app" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email.trim() || !password) {
      setErrorMessage('Email dan password wajib diisi.');

      return;
    }

    try {
      setIsSubmitting(true);

      setErrorMessage(null);

      await signIn(email, password);

      navigate('/app', {
        replace: true,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden bg-[#111827] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="text-xl font-bold">OpsMate</div>

          <p className="mt-2 text-sm text-gray-400">Operations Management Platform</p>
        </div>

        <div className="max-w-lg">
          <h1 className="text-5xl font-semibold leading-tight">Kelola operasi lapangan dari satu dashboard.</h1>

          <p className="mt-6 text-lg leading-8 text-gray-400">Work Order, customer, teknisi, evidence, dan progres pekerjaan dapat dipantau dalam satu sistem.</p>
        </div>

        <p className="text-xs text-gray-500">OpsMate Admin</p>
      </section>

      <section className="flex items-center justify-center bg-[#F7F7F8] px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <div className="text-xl font-bold">OpsMate</div>

            <div className="text-sm text-gray-500">Admin</div>
          </div>

          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white">
            <LockKeyhole className="h-5 w-5" />
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-gray-950">Masuk ke Admin</h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">Gunakan akun Admin OpsMate untuk melanjutkan.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                placeholder="admin@opsmate.com"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            {errorMessage ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
