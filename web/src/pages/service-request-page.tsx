import { ChevronLeft, ChevronRight, Inbox, RefreshCw, Search } from 'lucide-react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useState, type FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import { ServiceRequestStatusBadge } from '../components/service-request-status-badge';

import { fetchServiceRequests } from '../services/service-request.service';

import type { ServiceRequestStatus } from '../types/service-request';

import { formatDateTime } from '../utils/date';

type StatusFilter = 'ALL' | ServiceRequestStatus;

const PAGE_SIZE = 10;

const statuses: Array<{
  value: StatusFilter;

  label: string;
}> = [
  {
    value: 'ALL',

    label: 'Semua Status',
  },

  {
    value: 'SUBMITTED',

    label: 'Submitted',
  },

  {
    value: 'UNDER_REVIEW',

    label: 'Under Review',
  },

  {
    value: 'ACCEPTED',

    label: 'Accepted',
  },

  {
    value: 'REJECTED',

    label: 'Rejected',
  },

  {
    value: 'CANCELLED',

    label: 'Cancelled',
  },

  {
    value: 'CONVERTED',

    label: 'Converted',
  },
];

export function ServiceRequestsPage() {
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState<StatusFilter>('ALL');

  const navigate = useNavigate();

  const serviceRequestsQuery = useQuery({
    queryKey: [
      'service-requests',

      {
        page,
        search,
        status,
      },
    ],

    queryFn: () =>
      fetchServiceRequests({
        page,

        limit: PAGE_SIZE,

        search: search || undefined,

        status: status === 'ALL' ? 'all' : status,
      }),

    placeholderData: keepPreviousData,
  });

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    setPage(1);

    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setPage(1);

    setSearchInput('');

    setSearch('');

    setStatus('ALL');
  }

  const response = serviceRequestsQuery.data;

  const requests = response?.data.serviceRequests ?? [];

  const pagination = response?.data.pagination;

  return (
    <>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Customer Intake</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Service Requests</h1>

          <p className="mt-2 text-sm text-gray-500">Review permintaan service yang dikirim oleh customer.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            void serviceRequestsQuery.refetch();
          }}
          disabled={serviceRequestsQuery.isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={['h-4 w-4', serviceRequestsQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
          Refresh
        </button>
      </header>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari nomor request, customer, service, telepon..."
                className="h-11 w-full rounded-l-xl border border-gray-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <button type="submit" className="h-11 rounded-r-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:bg-gray-800">
              Cari
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);

              setStatus(event.target.value as StatusFilter);
            }}
            className="h-11 min-w-[210px] rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
          >
            {statuses.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          {(search || status !== 'ALL') && (
            <button type="button" onClick={clearFilters} className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Reset
            </button>
          )}
        </div>
      </section>

      {serviceRequestsQuery.isError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serviceRequestsQuery.error instanceof Error ? serviceRequestsQuery.error.message : 'Service Request gagal dimuat.'}</div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-gray-950">Inbox</h2>

            <p className="mt-1 text-sm text-gray-500">{pagination ? `${pagination.total} Service Request ditemukan` : 'Memuat data...'}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <Inbox className="h-5 w-5 text-gray-700" />
          </div>
        </div>

        {serviceRequestsQuery.isPending ? (
          <div className="p-14 text-center text-sm text-gray-400">Memuat Service Request...</div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">Request</th>

                  <th className="px-6 py-3">Customer</th>

                  <th className="px-6 py-3">Service</th>

                  <th className="px-6 py-3">Preferred Schedule</th>

                  <th className="px-6 py-3">Status</th>

                  <th className="px-6 py-3">Dibuat</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(`/app/service-requests/${request.id}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/app/service-requests/${request.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50/70 focus:bg-gray-50 focus:outline-none"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{request.requestNumber}</div>

                      <div className="mt-1 max-w-[260px] truncate text-sm text-gray-500">{request.title}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{request.customer.name}</div>

                      <div className="mt-1 text-xs text-gray-400">{request.customer.phone}</div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{request.serviceType}</div>

                      <div className="mt-1 text-xs text-gray-400">{request.customer.email ?? '-'}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">{request.preferredSchedule ? formatDateTime(request.preferredSchedule) : 'Tidak ditentukan'}</td>

                    <td className="px-6 py-4">
                      <ServiceRequestStatusBadge status={request.status} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(request.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <Inbox className="mx-auto h-8 w-8 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-800">Service Request tidak ditemukan</h3>

            <p className="mt-2 text-sm text-gray-400">Request customer akan muncul di sini setelah dikirim dari Customer Mobile.</p>
          </div>
        )}

        {pagination && pagination.totalPages > 0 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">
              Halaman {pagination.page} dari {pagination.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || serviceRequestsQuery.isFetching}
                onClick={() =>
                  setPage((current) =>
                    Math.max(
                      1,

                      current - 1,
                    ),
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={page >= pagination.totalPages || serviceRequestsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
