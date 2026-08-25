import { ArrowLeft, ClipboardList, Edit3, Mail, Phone, RefreshCw, ShieldCheck, UserRoundCog } from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { Link, useParams } from 'react-router-dom';

import type { ComponentType } from 'react';

import { TechnicianStatusBadge } from '../components/technician-status-badge';

import { fetchTechnicianDetail, updateTechnicianStatus } from '../services/technician.service';

import { formatDateTime } from '../utils/date';

export function TechnicianDetailPage() {
  const { technicianId } = useParams<{
    technicianId: string;
  }>();

  const queryClient = useQueryClient();

  const technicianQuery = useQuery({
    queryKey: ['technician', technicianId],

    queryFn: () => {
      if (!technicianId) {
        throw new Error('Technician ID tidak valid');
      }

      return fetchTechnicianDetail(technicianId);
    },

    enabled: Boolean(technicianId),
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) => {
      if (!technicianId) {
        throw new Error('Technician ID tidak valid');
      }

      return updateTechnicianStatus(technicianId, isActive);
    },

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['technician', technicianId],
        }),

        queryClient.invalidateQueries({
          queryKey: ['technicians'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['technician-options'],
        }),

        queryClient.invalidateQueries({
          queryKey: ['dashboard'],
        }),
      ]);
    },
  });

  if (technicianQuery.isPending) {
    return <div className="p-20 text-center text-sm text-gray-400">Memuat technician...</div>;
  }

  if (technicianQuery.isError || !technicianQuery.data) {
    return (
      <div>
        <Link to="/app/technicians" className="text-sm text-gray-500">
          ← Technicians
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">Technician gagal dimuat.</div>
      </div>
    );
  }

  const technician = technicianQuery.data.data.technician;

  async function handleStatusChange() {
    const nextStatus = !technician.isActive;

    const confirmed = window.confirm(nextStatus ? `Aktifkan kembali akun ${technician.name}?` : `Nonaktifkan akun ${technician.name}? Technician akan kehilangan seluruh sesi login aktif.`);

    if (!confirmed) {
      return;
    }

    try {
      const response = await statusMutation.mutateAsync(nextStatus);

      if (!nextStatus && response.data.revokedSessionsCount > 0) {
        window.alert(`${response.data.revokedSessionsCount} sesi login technician berhasil dicabut.`);
      }
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Status technician gagal diperbarui.');
    }
  }

  return (
    <>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link to="/app/technicians" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
            <ArrowLeft className="h-4 w-4" />
            Technicians
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{technician.name}</h1>

            <TechnicianStatusBadge isActive={technician.isActive} />
          </div>

          <p className="mt-2 text-sm text-gray-500">Detail akun technician OpsMate.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              void technicianQuery.refetch();
            }}
            disabled={technicianQuery.isFetching}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <Link to={`/app/technicians/${technician.id}/edit`} className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700">
            <Edit3 className="h-4 w-4" />
            Edit
          </Link>

          <button
            type="button"
            disabled={statusMutation.isPending}
            onClick={() => {
              void handleStatusChange();
            }}
            className={['inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50', technician.isActive ? 'bg-red-700 hover:bg-red-800' : 'bg-emerald-700 hover:bg-emerald-800'].join(' ')}
          >
            {technician.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-950">Profil Technician</h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Info icon={UserRoundCog} label="Nama" value={technician.name} />

            <Info icon={Mail} label="Email" value={technician.email} />

            <Info icon={Phone} label="Telepon" value={technician.phone ?? '-'} />

            <Info icon={ShieldCheck} label="Role" value={technician.role} />

            <Info icon={RefreshCw} label="Dibuat" value={formatDateTime(technician.createdAt)} />

            <Info icon={RefreshCw} label="Terakhir diperbarui" value={formatDateTime(technician.updatedAt)} />
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm font-medium text-gray-400">ASSIGNED WORK ORDERS</p>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <ClipboardList className="h-5 w-5 text-gray-600" />
              </div>

              <div>
                <div className="text-3xl font-semibold text-gray-950">{technician.assignedWorkOrdersCount}</div>

                <p className="text-sm text-gray-500">Total assignment</p>
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-gray-400">Angka ini mencakup seluruh Work Order yang pernah ditugaskan kepada technician.</p>
          </section>

          {!technician.isActive ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-semibold text-red-800">Akun tidak aktif</h3>

              <p className="mt-2 text-sm leading-6 text-red-700">Technician tidak dapat menggunakan sesi login aktif sampai akun diaktifkan kembali.</p>
            </section>
          ) : null}
        </aside>
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

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-gray-700">{value}</p>
      </div>
    </div>
  );
}
