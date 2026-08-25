import { ArrowLeft, Edit3, Mail, MapPin, Phone, RefreshCw, StickyNote, UserRound } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

import { Link, useParams } from 'react-router-dom';

import type { ComponentType } from 'react';

import { fetchCustomerDetail } from '../services/customer.service';

import { formatDateTime } from '../utils/date';

export function CustomerDetailPage() {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const customerQuery = useQuery({
    queryKey: ['customer', customerId],

    queryFn: () => {
      if (!customerId) {
        throw new Error('Customer ID tidak valid');
      }

      return fetchCustomerDetail(customerId);
    },

    enabled: Boolean(customerId),
  });

  if (customerQuery.isPending) {
    return <div className="p-20 text-center text-sm text-gray-400">Memuat customer...</div>;
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div>
        <Link to="/app/customers" className="text-sm text-gray-500">
          ← Customers
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">Customer gagal dimuat.</div>
      </div>
    );
  }

  const customer = customerQuery.data.data.customer;

  return (
    <>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link to="/app/customers" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
            <ArrowLeft className="h-4 w-4" />
            Customers
          </Link>

          <h1 className="mt-5 text-3xl font-semibold tracking-tight text-gray-950">{customer.name}</h1>

          <p className="mt-2 text-sm text-gray-500">Detail customer OpsMate.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              void customerQuery.refetch();
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link to={`/app/customers/${customer.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white">
            <Edit3 className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-950">Informasi Customer</h2>

          <div className="mt-6 space-y-5">
            <Info icon={UserRound} label="Nama" value={customer.name} />

            <Info icon={Phone} label="Telepon" value={customer.phone} />

            <Info icon={Mail} label="Email" value={customer.email ?? '-'} />

            <Info icon={MapPin} label="Alamat" value={customer.address} />

            <Info icon={StickyNote} label="Catatan" value={customer.notes ?? '-'} />
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-950">Metadata</h2>

          <div className="mt-6 space-y-5">
            <Info icon={UserRound} label="Customer ID" value={customer.id} />

            <Info icon={RefreshCw} label="Dibuat" value={formatDateTime(customer.createdAt)} />

            <Info icon={RefreshCw} label="Terakhir diperbarui" value={formatDateTime(customer.updatedAt)} />
          </div>
        </section>
      </div>
    </>
  );
}

type IconType = ComponentType<{
  className?: string;
}>;

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: IconType;

  label: string;

  value: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400">{label}</p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-gray-700">{value}</p>
      </div>
    </div>
  );
}
