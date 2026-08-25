import { LoaderCircle } from 'lucide-react';

import { useState, type FormEvent } from 'react';

export type TechnicianFormValues = {
  name: string;

  email: string;

  phone: string;

  password: string;
};

type Props = {
  mode: 'create' | 'edit';

  initialValues?: TechnicianFormValues;

  isSubmitting: boolean;

  errorMessage?: string | null;

  onSubmit: (values: TechnicianFormValues) => Promise<void>;
};

export function TechnicianForm({ mode, initialValues, isSubmitting, errorMessage, onSubmit }: Props) {
  const [values, setValues] = useState<TechnicianFormValues>(
    initialValues ?? {
      name: '',
      email: '',
      phone: '',
      password: '',
    },
  );

  const [localError, setLocalError] = useState<string | null>(null);

  function updateField(
    field: keyof TechnicianFormValues,

    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setLocalError(null);
  }

  function validate(): string | null {
    const name = values.name.trim();

    const email = values.email.trim();

    const phone = values.phone.trim();

    if (name.length < 2 || name.length > 100) {
      return 'Nama harus 2–100 karakter.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Format email tidak valid.';
    }

    if (phone && (phone.length < 8 || phone.length > 20)) {
      return 'Nomor telepon harus 8–20 karakter.';
    }

    if (mode === 'create' && (values.password.length < 8 || values.password.length > 128)) {
      return 'Password harus 8–128 karakter.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationError = validate();

    if (validationError) {
      setLocalError(validationError);

      return;
    }

    setLocalError(null);

    await onSubmit(values);
  }

  const visibleError = localError ?? errorMessage;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-950">Informasi Technician</h2>

        <p className="mt-1 text-sm text-gray-400">Informasi akun technician OpsMate.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="technician-name" className="mb-2 block text-sm font-medium text-gray-700">
              Nama
            </label>

            <input
              id="technician-name"
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={100}
              placeholder="Budi Santoso"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </div>

          <div>
            <label htmlFor="technician-phone" className="mb-2 block text-sm font-medium text-gray-700">
              Telepon
            </label>

            <input
              id="technician-phone"
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              maxLength={20}
              placeholder="081234567890"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />

            <p className="mt-1.5 text-xs text-gray-400">Opsional.</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="technician-email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              id="technician-email"
              type="email"
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="technician@opsmate.com"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </div>

          {mode === 'create' ? (
            <div className="md:col-span-2">
              <label htmlFor="technician-password" className="mb-2 block text-sm font-medium text-gray-700">
                Password Awal
              </label>

              <input
                id="technician-password"
                type="password"
                value={values.password}
                onChange={(event) => updateField('password', event.target.value)}
                autoComplete="new-password"
                placeholder="Minimal 8 karakter"
                className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              <p className="mt-2 text-xs leading-5 text-gray-400">Password ini digunakan technician untuk login ke aplikasi mobile.</p>
            </div>
          ) : null}
        </div>
      </section>

      {visibleError ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{visibleError}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Menyimpan...
          </>
        ) : mode === 'create' ? (
          'Buat Technician'
        ) : (
          'Simpan Perubahan'
        )}
      </button>
    </form>
  );
}
