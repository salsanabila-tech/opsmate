import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, UserRoundCog } from 'lucide-react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { Link, useNavigate } from 'react-router-dom';

import { useState, type FormEvent } from 'react';

import { TechnicianStatusBadge } from '../components/technician-status-badge';

import { fetchTechnicians } from '../services/technician.service';

import type { TechnicianStatusFilter } from '../types/technician';

import { formatDateTime } from '../utils/date';

const PAGE_SIZE = 10;

export function TechniciansPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');

  const [search, setSearch] = useState('');

  const [status, setStatus] = useState<TechnicianStatusFilter>('all');

  const techniciansQuery = useQuery({
    queryKey: [
      'technicians',
      {
        page,
        search,
        status,
      },
    ],

    queryFn: () =>
      fetchTechnicians({
        page,

        limit: PAGE_SIZE,

        search: search || undefined,

        status,
      }),

    placeholderData: keepPreviousData,
  });

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    setPage(1);

    setSearch(searchInput.trim());
  }

  function resetFilters() {
    setPage(1);

    setSearchInput('');

    setSearch('');

    setStatus('all');
  }

  const response = techniciansQuery.data;

  const pagination = response?.data.pagination;

  return (
    <>
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">TEAM</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Technicians</h1>

          <p className="mt-2 text-sm text-gray-500">Kelola akun technician dan akses mobile OpsMate.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              void techniciansQuery.refetch();
            }}
            disabled={techniciansQuery.isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={['h-4 w-4', techniciansQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>

          <Link to="/app/technicians/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            Technician Baru
          </Link>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <form onSubmit={handleSearch} className="flex flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Cari nama atau email technician..."
                className="h-11 w-full rounded-l-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />
            </div>

            <button type="submit" className="h-11 rounded-r-xl bg-gray-950 px-5 text-sm font-semibold text-white">
              Cari
            </button>
          </form>

          <select
            value={status}
            onChange={(event) => {
              setPage(1);

              setStatus(event.target.value as TechnicianStatusFilter);
            }}
            className="h-11 min-w-[180px] rounded-xl border border-gray-200 bg-white px-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
          >
            <option value="all">Semua</option>

            <option value="active">Aktif</option>

            <option value="inactive">Tidak Aktif</option>
          </select>

          {search || status !== 'all' ? (
            <button type="button" onClick={resetFilters} className="h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Reset
            </button>
          ) : null}
        </div>
      </section>

      {techniciansQuery.isError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{techniciansQuery.error instanceof Error ? techniciansQuery.error.message : 'Technician gagal dimuat.'}</div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-gray-950">Daftar Technician</h2>

            <p className="mt-1 text-sm text-gray-500">{pagination ? `${pagination.total} technician` : 'Memuat data...'}</p>
          </div>

          <UserRoundCog className="h-5 w-5 text-gray-400" />
        </div>

        {techniciansQuery.isPending ? (
          <div className="p-14 text-center text-sm text-gray-400">Memuat technician...</div>
        ) : response && response.data.technicians.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">Technician</th>

                  <th className="px-6 py-3">Email</th>

                  <th className="px-6 py-3">Phone</th>

                  <th className="px-6 py-3">Status</th>

                  <th className="px-6 py-3">Updated</th>

                  <th className="w-12 px-6 py-3" />
                </tr>
              </thead>

              <tbody>
                {response.data.technicians.map((technician) => (
                  <tr
                    key={technician.id}
                    tabIndex={0}
                    role="button"
                    onClick={() => navigate(`/app/technicians/${technician.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/app/technicians/${technician.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{technician.name}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">{technician.email}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">{technician.phone ?? '-'}</td>

                    <td className="px-6 py-4">
                      <TechnicianStatusBadge isActive={technician.isActive} />
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-400">{formatDateTime(technician.updatedAt)}</td>

                    <td className="px-6 py-4">
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-14 text-center">
            <UserRoundCog className="mx-auto h-8 w-8 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-800">Technician tidak ditemukan</h3>

            <p className="mt-2 text-sm text-gray-400">Coba ubah pencarian atau filter.</p>
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
                disabled={!pagination.hasPreviousPage || techniciansQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || techniciansQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm disabled:opacity-40"
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
