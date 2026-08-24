import { ArrowLeft, CalendarDays, LoaderCircle, UserRound, Wrench } from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Link, useNavigate } from 'react-router-dom';

import { useState, type FormEvent, type ReactNode } from 'react';

import { fetchActiveTechnicianOptions, fetchCustomerOptions } from '../services/directory.service';

import { createWorkOrder } from '../services/work-order.service';

type FormState = {
  customerId: string;

  technicianId: string;

  title: string;

  description: string;

  scheduledAt: string;
};

const initialForm: FormState = {
  customerId: '',

  technicianId: '',

  title: '',

  description: '',

  scheduledAt: '',
};

export function CreateWorkOrderPage() {
  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>(initialForm);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ['customer-options'],

    queryFn: fetchCustomerOptions,
  });

  const techniciansQuery = useQuery({
    queryKey: ['technician-options'],

    queryFn: fetchActiveTechnicianOptions,
  });

  const createMutation = useMutation({
    mutationFn: createWorkOrder,

    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['work-orders'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ]);

      navigate(`/app/work-orders/${response.data.id}`, {
        replace: true,
      });
    },
  });

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrorMessage(null);
  }

  function validateForm(): string | null {
    if (!form.customerId) {
      return 'Customer wajib dipilih.';
    }

    if (form.title.trim().length < 3) {
      return 'Judul minimal 3 karakter.';
    }

    if (form.title.trim().length > 150) {
      return 'Judul maksimal 150 karakter.';
    }

    if (form.description.trim().length < 5) {
      return 'Deskripsi minimal 5 karakter.';
    }

    if (form.description.trim().length > 5000) {
      return 'Deskripsi maksimal 5000 karakter.';
    }

    if (!form.scheduledAt) {
      return 'Jadwal pekerjaan wajib diisi.';
    }

    const scheduledDate = new Date(form.scheduledAt);

    if (Number.isNaN(scheduledDate.getTime())) {
      return 'Jadwal pekerjaan tidak valid.';
    }

    if (scheduledDate.getTime() <= Date.now()) {
      return 'Jadwal harus berada di masa depan.';
    }

    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (createMutation.isPending) {
      return;
    }

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);

      return;
    }

    try {
      setErrorMessage(null);

      await createMutation.mutateAsync({
        customerId: form.customerId,

        technicianId: form.technicianId || null,

        title: form.title,

        description: form.description,

        scheduledAt: new Date(form.scheduledAt).toISOString(),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Work Order gagal dibuat.');
    }
  }

  const customers = customersQuery.data?.data.customers ?? [];

  const technicians = techniciansQuery.data?.data.technicians ?? [];

  const directoryLoading = customersQuery.isPending || techniciansQuery.isPending;

  return (
    <>
      <header>
        <Link to="/app/work-orders" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950">
          <ArrowLeft className="h-4 w-4" />
          Work Orders
        </Link>

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-400">OPERATIONS</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Buat Work Order</h1>

          <p className="mt-2 text-sm text-gray-500">Buat pekerjaan baru dan tentukan customer, jadwal, serta technician.</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <FormSection title="Informasi Pekerjaan" description="Masukkan detail pekerjaan yang harus dilakukan.">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Judul Work Order
              </label>

              <input
                id="title"
                value={form.title}
                onChange={(event) => updateField('title', event.target.value)}
                maxLength={150}
                placeholder="Contoh: Perbaikan AC ruang meeting"
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              <p className="mt-1.5 text-right text-xs text-gray-400">{form.title.length}/150</p>
            </div>

            <div className="mt-5">
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                Deskripsi
              </label>

              <textarea
                id="description"
                value={form.description}
                onChange={(event) => updateField('description', event.target.value)}
                maxLength={5000}
                rows={8}
                placeholder="Jelaskan kondisi, pekerjaan yang harus dilakukan, dan informasi penting lainnya..."
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              <p className="mt-1.5 text-right text-xs text-gray-400">
                {form.description.length}
                /5000
              </p>
            </div>
          </FormSection>

          <FormSection title="Jadwal" description="Tentukan waktu pekerjaan dilakukan.">
            <label htmlFor="scheduledAt" className="mb-2 block text-sm font-medium text-gray-700">
              Tanggal & Waktu
            </label>

            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                id="scheduledAt"
                type="datetime-local"
                value={form.scheduledAt}
                onChange={(event) => updateField('scheduledAt', event.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-gray-400">Jadwal wajib berada di masa depan.</p>
          </FormSection>
        </div>

        <aside className="space-y-6">
          <FormSection title="Assignment" description="Pilih customer dan technician.">
            {directoryLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-gray-400">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Memuat data...
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="customer" className="mb-2 block text-sm font-medium text-gray-700">
                    Customer
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <select
                      id="customer"
                      value={form.customerId}
                      onChange={(event) => updateField('customerId', event.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    >
                      <option value="">Pilih customer</option>

                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} — {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>

                  {customers.length === 0 ? <p className="mt-2 text-xs text-amber-700">Belum ada customer. Buat customer terlebih dahulu.</p> : null}
                </div>

                <div className="mt-5">
                  <label htmlFor="technician" className="mb-2 block text-sm font-medium text-gray-700">
                    Technician
                  </label>

                  <div className="relative">
                    <Wrench className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <select
                      id="technician"
                      value={form.technicianId}
                      onChange={(event) => updateField('technicianId', event.target.value)}
                      className="h-11 w-full appearance-none rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    >
                      <option value="">Belum ditugaskan</option>

                      {technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.name} — {technician.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <p className="mt-2 text-xs leading-5 text-gray-400">Kosongkan jika Work Order belum ingin ditugaskan.</p>
                </div>
              </>
            )}
          </FormSection>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-950">Status Awal</h2>

            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium text-gray-400">Work Order akan dibuat sebagai</p>

              <p className="mt-1 text-sm font-semibold text-gray-900">{form.technicianId ? 'ASSIGNED' : 'PENDING'}</p>
            </div>

            <p className="mt-3 text-xs leading-5 text-gray-400">Jika technician dipilih, Work Order langsung ditugaskan. Jika tidak, status awal adalah Pending.</p>
          </section>

          {errorMessage || customersQuery.isError || techniciansQuery.isError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">{errorMessage ?? 'Data customer atau technician gagal dimuat.'}</div>
          ) : null}

          <button
            type="submit"
            disabled={createMutation.isPending || directoryLoading || customers.length === 0}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createMutation.isPending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Membuat Work Order...
              </>
            ) : (
              'Buat Work Order'
            )}
          </button>

          <Link to="/app/work-orders" className="flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50">
            Batal
          </Link>
        </aside>
      </form>
    </>
  );
}

type FormSectionProps = {
  title: string;

  description: string;

  children: ReactNode;
};

function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="font-semibold text-gray-950">{title}</h2>

      <p className="mt-1 text-sm text-gray-400">{description}</p>

      <div className="mt-6">{children}</div>
    </section>
  );
}
