import { CheckCircle2, ClipboardList, RefreshCw, Users, UserRoundCog } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

import { Link } from 'react-router-dom';

import { useAuth } from '../context/auth-context';

import { fetchDashboardSummary, fetchWorkOrderSnapshot } from '../services/work-order.service';

import { formatDateTime } from '../utils/date';

import { WorkOrderStatusBadge } from '../components/work-order-status-badge';

export function DashboardPage() {
  const { user } = useAuth();

  const summaryQuery = useQuery({
    queryKey: ['dashboard', 'summary'],

    queryFn: fetchDashboardSummary,
  });

  const snapshotQuery = useQuery({
    queryKey: ['dashboard', 'work-orders'],

    queryFn: fetchWorkOrderSnapshot,
  });

  const cards = [
    {
      title: 'Total Work Orders',

      value: summaryQuery.data?.totalWorkOrders ?? '—',

      icon: ClipboardList,
    },

    {
      title: 'Work Orders Selesai',

      value: summaryQuery.data?.completedWorkOrders ?? '—',

      icon: CheckCircle2,
    },

    {
      title: 'Customers',

      value: summaryQuery.data?.totalCustomers ?? '—',

      icon: Users,
    },

    {
      title: 'Technicians',

      value: summaryQuery.data?.totalTechnicians ?? '—',

      icon: UserRoundCog,
    },
  ];

  function refreshDashboard() {
    void summaryQuery.refetch();

    void snapshotQuery.refetch();
  }

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">DASHBOARD</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Halo, {user?.name}</h1>

          <p className="mt-2 text-sm text-gray-500">Berikut ringkasan operasi OpsMate.</p>
        </div>

        <button
          type="button"
          onClick={refreshDashboard}
          disabled={summaryQuery.isFetching || snapshotQuery.isFetching}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={['h-4 w-4', summaryQuery.isFetching || snapshotQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
          Refresh
        </button>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ title, value, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Icon className="h-5 w-5 text-gray-700" />
            </div>

            <div className="mt-5 text-3xl font-semibold text-gray-950">{summaryQuery.isPending ? '...' : value}</div>

            <div className="mt-1 text-sm text-gray-500">{title}</div>
          </article>
        ))}
      </section>

      {summaryQuery.isError ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{summaryQuery.error instanceof Error ? summaryQuery.error.message : 'Ringkasan dashboard gagal dimuat.'}</div>
      ) : null}

      <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="font-semibold text-gray-950">Work Order Snapshot</h2>

            <p className="mt-1 text-sm text-gray-500">Lima Work Order dari daftar operasional.</p>
          </div>

          <Link to="/app/work-orders" className="text-sm font-semibold text-gray-700 hover:text-gray-950">
            Lihat semua
          </Link>
        </div>

        {snapshotQuery.isPending ? (
          <div className="p-10 text-center text-sm text-gray-400">Memuat Work Order...</div>
        ) : snapshotQuery.isError ? (
          <div className="p-10 text-center text-sm text-red-600">Work Order gagal dimuat.</div>
        ) : snapshotQuery.data.data.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">Belum ada Work Order.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <th className="px-6 py-3">Work Order</th>

                  <th className="px-6 py-3">Customer</th>

                  <th className="px-6 py-3">Technician</th>

                  <th className="px-6 py-3">Jadwal</th>

                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {snapshotQuery.data.data.map((workOrder) => (
                  <tr key={workOrder.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{workOrder.workOrderNumber}</div>

                      <div className="mt-1 max-w-[260px] truncate text-sm text-gray-500">{workOrder.title}</div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-700">{workOrder.customer.name}</td>

                    <td className="px-6 py-4 text-sm text-gray-700">{workOrder.technician?.name ?? 'Belum ditugaskan'}</td>

                    <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(workOrder.scheduledAt)}</td>

                    <td className="px-6 py-4">
                      <WorkOrderStatusBadge status={workOrder.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
