import { LoaderCircle } from 'lucide-react';

import { useState, type FormEvent } from 'react';

export type CustomerFormValues = {
  name: string;

  phone: string;

  email: string;

  address: string;

  notes: string;
};

type Props = {
  initialValues?: CustomerFormValues;

  submitLabel: string;

  isSubmitting: boolean;

  errorMessage?: string | null;

  onSubmit: (values: CustomerFormValues) => Promise<void>;
};

export function CustomerForm({ initialValues, submitLabel, isSubmitting, errorMessage, onSubmit }: Props) {
  const [values, setValues] = useState<CustomerFormValues>(
    initialValues ?? {
      name: '',
      phone: '',
      email: '',
      address: '',
      notes: '',
    },
  );

  const [localError, setLocalError] = useState<string | null>(null);

  function updateField(
    field: keyof CustomerFormValues,

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

    const phone = values.phone.trim();

    const email = values.email.trim();

    const address = values.address.trim();

    const notes = values.notes.trim();

    if (name.length < 2 || name.length > 100) {
      return 'Nama harus 2–100 karakter.';
    }

    if (phone.length < 8 || phone.length > 20) {
      return 'Nomor telepon harus 8–20 karakter.';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Format email tidak valid.';
    }

    if (address.length < 5 || address.length > 500) {
      return 'Alamat harus 5–500 karakter.';
    }

    if (notes.length > 1000) {
      return 'Catatan maksimal 1000 karakter.';
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
        <h2 className="font-semibold text-gray-950">Informasi Customer</h2>

        <p className="mt-1 text-sm text-gray-400">Data utama customer yang digunakan pada Work Order.</p>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="customer-name" className="mb-2 block text-sm font-medium text-gray-700">
              Nama
            </label>

            <input
              id="customer-name"
              value={values.name}
              onChange={(event) => updateField('name', event.target.value)}
              maxLength={100}
              placeholder="PT Contoh Indonesia"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </div>

          <div>
            <label htmlFor="customer-phone" className="mb-2 block text-sm font-medium text-gray-700">
              Nomor Telepon
            </label>

            <input
              id="customer-phone"
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              maxLength={20}
              placeholder="081234567890"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="customer-email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>

            <input
              id="customer-email"
              type="email"
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="customer@example.com"
              className="h-11 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />

            <p className="mt-1.5 text-xs text-gray-400">Email bersifat opsional.</p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="customer-address" className="mb-2 block text-sm font-medium text-gray-700">
              Alamat
            </label>

            <textarea
              id="customer-address"
              value={values.address}
              onChange={(event) => updateField('address', event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Alamat lengkap customer..."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />

            <p className="mt-1.5 text-right text-xs text-gray-400">
              {values.address.length}
              /500
            </p>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="customer-notes" className="mb-2 block text-sm font-medium text-gray-700">
              Catatan
            </label>

            <textarea
              id="customer-notes"
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Catatan tambahan customer..."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm leading-6 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />

            <p className="mt-1.5 text-right text-xs text-gray-400">
              {values.notes.length}
              /1000
            </p>
          </div>
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
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
