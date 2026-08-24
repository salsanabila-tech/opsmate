import { ChevronLeft, ChevronRight, ClipboardList, RefreshCw, Search } from 'lucide-react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { useState, type FormEvent } from 'react';

import { useNavigate } from 'react-router-dom';

import { fetchWorkOrders } from '../services/work-order.service';

import type { WorkOrderStatus } from '../types/work.order';

import { formatDateTime } from '../utils/date';

import { WorkOrderStatusBadge } from '../components/work-order-status-badge';

type StatusFilter = 'ALL' | WorkOrderStatus;

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
    value: 'PENDING',
    label: 'Pending',
  },

  {
    value: 'ASSIGNED',
    label: 'Ditugaskan',
  },

  {
    value: 'ON_THE_WAY',
    label: 'Dalam Perjalanan',
  },

  {
    value: 'IN_PROGRESS',
    label: 'Dikerjakan',
  },

  {
    value: 'COMPLETED',
    label: 'Selesai',
  },

  {
    value: 'CANCELLED',
    label: 'Dibatalkan',
  },
];

export function WorkOrdersPage() {
  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState<StatusFilter>('ALL');

  const workOrdersQuery = useQuery({
    queryKey: [
      'work-orders',
      {
        page,
        search,
        status,
      },
    ],

    queryFn: () =>
      fetchWorkOrders({
        page,

        limit: PAGE_SIZE,

        search: search || undefined,

        status: status === 'ALL' ? undefined : status,
      }),

    placeholderData: keepPreviousData,
  });

  const navigate = useNavigate();

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

  const response = workOrdersQuery.data;

  const meta = response?.meta;

  return (
    <>
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">OPERATIONS</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Work Orders</h1>

          <p className="mt-2 text-sm text-gray-500">Pantau seluruh pekerjaan yang berjalan di OpsMate.</p>
        </div>

        <button
          type="button"
          onClick={() => {
            void workOrdersQuery.refetch();
          }}
          disabled={workOrdersQuery.isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={['h-4 w-4', workOrdersQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
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
                placeholder="Cari nomor atau judul Work Order..."
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
            className="h-11 min-w-[200px] rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
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

      {workOrdersQuery.isError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{workOrdersQuery.error instanceof Error ? workOrdersQuery.error.message : 'Work Order gagal dimuat.'}</div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-gray-950">Daftar Work Order</h2>

            <p className="mt-1 text-sm text-gray-500">{meta ? `${meta.total} Work Order ditemukan` : 'Memuat data...'}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
            <ClipboardList className="h-5 w-5 text-gray-700" />
          </div>
        </div>

        {workOrdersQuery.isPending ? (
          <div className="p-14 text-center text-sm text-gray-400">Memuat Work Order...</div>
        ) : response && response.data.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">Work Order</th>

                  <th className="px-6 py-3">Customer</th>

                  <th className="px-6 py-3">Technician</th>

                  <th className="px-6 py-3">Jadwal</th>

                  <th className="px-6 py-3">Status</th>

                  <th className="px-6 py-3">Dibuat Oleh</th>

                  <th className="w-12 px-6 py-3" />
                </tr>
              </thead>

              <tbody>
                {response.data.map((workOrder) => (
                  <tr
                    key={workOrder.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      navigate(`/app/work-orders/${workOrder.id}`);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/app/work-orders/${workOrder.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50/70 focus:bg-gray-50 focus:outline-none"
                  >
                    {' '}
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{workOrder.workOrderNumber}</div>

                      <div className="mt-1 max-w-[250px] truncate text-sm text-gray-500">{workOrder.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-800">{workOrder.customer.name}</div>

                      <div className="mt-1 text-xs text-gray-400">{workOrder.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {workOrder.technician ? (
                        <>
                          <div className="text-sm font-medium text-gray-800">{workOrder.technician.name}</div>

                          <div className="mt-1 text-xs text-gray-400">{workOrder.technician.isActive ? 'Aktif' : 'Tidak aktif'}</div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">Belum ditugaskan</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(workOrder.scheduledAt)}</td>
                    <td className="px-6 py-4">
                      <WorkOrderStatusBadge status={workOrder.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{workOrder.createdBy.name}</div>

                      <div className="mt-1 text-xs text-gray-400">{workOrder.createdBy.role}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-800">Work Order tidak ditemukan</h3>

            <p className="mt-2 text-sm text-gray-400">Coba ubah pencarian atau filter status.</p>
          </div>
        )}

        {meta && meta.totalPages > 0 ? (
          <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
            <p className="text-sm text-gray-500">
              Halaman {meta.page} dari {meta.totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || workOrdersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={page >= meta.totalPages || workOrdersQuery.isFetching}
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
