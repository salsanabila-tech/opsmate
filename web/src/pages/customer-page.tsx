import { ChevronLeft, ChevronRight, Plus, RefreshCw, Search, Users } from 'lucide-react';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { Link, useNavigate } from 'react-router-dom';

import { useState, type FormEvent } from 'react';

import { fetchCustomers } from '../services/customer.service';

import { formatDateTime } from '../utils/date';

const PAGE_SIZE = 10;

export function CustomersPage() {
  const navigate = useNavigate();

  const [page, setPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');

  const [search, setSearch] = useState('');

  const customersQuery = useQuery({
    queryKey: [
      'customers',
      {
        page,
        search,
      },
    ],

    queryFn: () =>
      fetchCustomers({
        page,

        limit: PAGE_SIZE,

        search: search || undefined,
      }),

    placeholderData: keepPreviousData,
  });

  function handleSearch(event: FormEvent) {
    event.preventDefault();

    setPage(1);

    setSearch(searchInput.trim());
  }

  function resetSearch() {
    setPage(1);

    setSearchInput('');

    setSearch('');
  }

  const response = customersQuery.data;

  const pagination = response?.data.pagination;

  return (
    <>
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">DIRECTORY</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Customers</h1>

          <p className="mt-2 text-sm text-gray-500">Kelola data customer OpsMate.</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              void customersQuery.refetch();
            }}
            disabled={customersQuery.isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={['h-4 w-4', customersQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>

          <Link to="/app/customers/new" className="inline-flex h-10 items-center gap-2 rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white hover:bg-gray-800">
            <Plus className="h-4 w-4" />
            Customer Baru
          </Link>
        </div>
      </header>

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-4">
        <form onSubmit={handleSearch} className="flex">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nama, telepon, atau email..."
              className="h-11 w-full rounded-l-xl border border-gray-200 pl-11 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
            />
          </div>

          <button type="submit" className="h-11 bg-gray-950 px-5 text-sm font-semibold text-white">
            Cari
          </button>

          {search ? (
            <button type="button" onClick={resetSearch} className="h-11 rounded-r-xl border border-l-0 border-gray-200 px-4 text-sm font-medium text-gray-600">
              Reset
            </button>
          ) : (
            <div className="w-3" />
          )}
        </form>
      </section>

      {customersQuery.isError ? <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{customersQuery.error instanceof Error ? customersQuery.error.message : 'Customer gagal dimuat.'}</div> : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-gray-950">Daftar Customer</h2>

            <p className="mt-1 text-sm text-gray-500">{pagination ? `${pagination.total} customer` : 'Memuat data...'}</p>
          </div>

          <Users className="h-5 w-5 text-gray-400" />
        </div>

        {customersQuery.isPending ? (
          <div className="p-14 text-center text-sm text-gray-400">Memuat customer...</div>
        ) : response && response.data.customers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">Customer</th>

                  <th className="px-6 py-3">Telepon</th>

                  <th className="px-6 py-3">Email</th>

                  <th className="px-6 py-3">Alamat</th>

                  <th className="px-6 py-3">Updated</th>

                  <th className="w-12 px-6 py-3" />
                </tr>
              </thead>

              <tbody>
                {response.data.customers.map((customer) => (
                  <tr
                    key={customer.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/app/customers/${customer.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        navigate(`/app/customers/${customer.id}`);
                      }
                    }}
                    className="cursor-pointer border-b border-gray-100 transition last:border-b-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{customer.name}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">{customer.phone}</td>

                    <td className="px-6 py-4 text-sm text-gray-600">{customer.email ?? '-'}</td>

                    <td className="max-w-[300px] truncate px-6 py-4 text-sm text-gray-500">{customer.address}</td>

                    <td className="px-6 py-4 text-sm text-gray-400">{formatDateTime(customer.updatedAt)}</td>

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
            <Users className="mx-auto h-8 w-8 text-gray-300" />

            <h3 className="mt-4 font-semibold text-gray-800">Customer tidak ditemukan</h3>
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
                disabled={!pagination.hasPreviousPage || customersQuery.isFetching}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Sebelumnya
              </button>

              <button
                type="button"
                disabled={!pagination.hasNextPage || customersQuery.isFetching}
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
