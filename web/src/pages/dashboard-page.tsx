import { ClipboardList, Users, UserRoundCog } from 'lucide-react';

import { useAuth } from '../context/auth-context';

const cards = [
  {
    title: 'Work Orders',
    value: '—',
    icon: ClipboardList,
  },

  {
    title: 'Customers',
    value: '—',
    icon: Users,
  },

  {
    title: 'Technicians',
    value: '—',
    icon: UserRoundCog,
  },
];

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <header>
        <p className="text-sm font-medium text-gray-400">DASHBOARD</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">Halo, {user?.name}</h1>

        <p className="mt-2 text-sm text-gray-500">Berikut ringkasan operasi OpsMate.</p>
      </header>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {cards.map(({ title, value, icon: Icon }) => (
          <article key={title} className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
              <Icon className="h-5 w-5 text-gray-700" />
            </div>

            <div className="mt-5 text-3xl font-semibold text-gray-950">{value}</div>

            <div className="mt-1 text-sm text-gray-500">{title}</div>
          </article>
        ))}
      </section>

      <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <h2 className="font-semibold text-gray-900">Admin Foundation Ready</h2>

        <p className="mt-2 text-sm text-gray-500">Work Order dashboard akan dibangun pada tahap 14G.3.</p>
      </section>
    </>
  );
}
