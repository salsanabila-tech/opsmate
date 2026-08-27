import { ArrowLeft, CalendarClock, ClipboardList, Mail, MapPin, Phone, RefreshCw, UserRound } from 'lucide-react';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useState, type ComponentType } from 'react';

import { Link, useParams } from 'react-router-dom';

import { ServiceRequestStatusBadge } from '../components/service-request-status-badge';

import { fetchServiceRequestDetail, updateServiceRequestStatus } from '../services/service-request.service';

import type { AdminServiceRequestStatus } from '../types/service-request';

import { formatDateTime } from '../utils/date';

export function ServiceRequestDetailPage() {
  const { serviceRequestId } = useParams<{
    serviceRequestId: string;
  }>();

  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');

  const serviceRequestQuery = useQuery({
    queryKey: ['service-request', serviceRequestId],

    queryFn: () => {
      if (!serviceRequestId) {
        throw new Error('Service Request ID tidak valid');
      }

      return fetchServiceRequestDetail(serviceRequestId);
    },

    enabled: Boolean(serviceRequestId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ status }: { status: AdminServiceRequestStatus }) => {
      if (!serviceRequestId) {
        throw new Error('Service Request ID tidak valid');
      }

      return updateServiceRequestStatus(serviceRequestId, {
        status,

        notes: notes.trim() || undefined,
      });
    },

    onSuccess: async () => {
      setNotes('');

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['service-request', serviceRequestId],
        }),

        queryClient.invalidateQueries({
          queryKey: ['service-requests'],
        }),
      ]);
    },
  });

  if (serviceRequestQuery.isPending) {
    return <div className="p-20 text-center text-sm text-gray-400">Memuat Service Request...</div>;
  }

  if (serviceRequestQuery.isError || !serviceRequestQuery.data) {
    return (
      <div>
        <Link to="/app/service-requests" className="text-sm text-gray-500">
          ← Service Requests
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-10 text-center text-red-700">{serviceRequestQuery.error instanceof Error ? serviceRequestQuery.error.message : 'Service Request gagal dimuat.'}</div>
      </div>
    );
  }

  const request = serviceRequestQuery.data.data.serviceRequest;

  const canReview = request.status === 'SUBMITTED';

  const canDecide = request.status === 'SUBMITTED' || request.status === 'UNDER_REVIEW';

  async function handleStatusChange(status: AdminServiceRequestStatus) {
    if (status === 'REJECTED' && !notes.trim()) {
      window.alert('Alasan penolakan wajib diisi.');

      return;
    }

    let confirmation = 'Perbarui status Service Request ini?';

    if (status === 'UNDER_REVIEW') {
      confirmation = 'Mulai review Service Request ini?';
    }

    if (status === 'ACCEPTED') {
      confirmation = 'Terima Service Request ini?';
    }

    if (status === 'REJECTED') {
      confirmation = 'Tolak Service Request ini?';
    }

    if (!window.confirm(confirmation)) {
      return;
    }

    try {
      await statusMutation.mutateAsync({
        status,
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Status Service Request gagal diperbarui.');
    }
  }

  return (
    <>
      <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <Link to="/app/service-requests" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
            <ArrowLeft className="h-4 w-4" />
            Service Requests
          </Link>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{request.requestNumber}</h1>

            <ServiceRequestStatusBadge status={request.status} />
          </div>

          <p className="mt-2 text-sm text-gray-500">Dikirim {formatDateTime(request.createdAt)}</p>
        </div>

        <button
          type="button"
          onClick={() => {
            void serviceRequestQuery.refetch();
          }}
          disabled={serviceRequestQuery.isFetching}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={['h-4 w-4', serviceRequestQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
          Refresh
        </button>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{request.serviceType}</p>

            <h2 className="mt-3 text-2xl font-semibold text-gray-950">{request.title}</h2>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-600">{request.description}</p>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-950">Informasi Layanan</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Info icon={MapPin} label="Alamat Service" value={request.serviceAddress} />

              <Info icon={Phone} label="Nomor Kontak" value={request.contactPhone} />

              <Info icon={CalendarClock} label="Preferred Schedule" value={request.preferredSchedule ? formatDateTime(request.preferredSchedule) : 'Tidak ditentukan'} />

              <Info icon={RefreshCw} label="Terakhir diperbarui" value={formatDateTime(request.updatedAt)} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-950">Timeline Status</h2>

            <div className="mt-6">
              {request.statusHistories.map((history, index) => (
                <div key={history.id} className="flex gap-4">
                  <div className="flex w-4 shrink-0 flex-col items-center">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-gray-950" />

                    {index < request.statusHistories.length - 1 ? <div className="mt-1 min-h-16 w-px flex-1 bg-gray-200" /> : null}
                  </div>

                  <div className="pb-7">
                    <div className="flex flex-wrap items-center gap-3">
                      <ServiceRequestStatusBadge status={history.newStatus} />

                      <span className="text-xs text-gray-400">{formatDateTime(history.createdAt)}</span>
                    </div>

                    {history.notes ? <p className="mt-3 text-sm leading-6 text-gray-600">{history.notes}</p> : null}

                    <p className="mt-2 text-xs text-gray-400">
                      Oleh <span className="font-medium text-gray-600">{history.changedBy.name}</span> · {history.changedBy.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="font-semibold text-gray-950">Customer</h2>

            <div className="mt-6 space-y-5">
              <Info icon={UserRound} label="Nama" value={request.customer.name} />

              <Info icon={Mail} label="Email" value={request.customer.email ?? '-'} />

              <Info icon={Phone} label="Telepon" value={request.customer.phone} />

              <Info icon={MapPin} label="Alamat Customer" value={request.customer.address} />
            </div>

            <Link to={`/app/customers/${request.customer.id}`} className="mt-6 inline-flex text-sm font-semibold text-gray-950 hover:underline">
              Buka profil customer →
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                <ClipboardList className="h-5 w-5 text-gray-600" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-950">Work Order</h2>

                <p className="text-xs text-gray-400">Operational job</p>
              </div>
            </div>

            {request.workOrder ? (
              <div className="mt-5">
                <div className="text-sm font-semibold text-gray-900">{request.workOrder.workOrderNumber}</div>

                <div className="mt-2 text-sm text-gray-500">{request.workOrder.status}</div>

                <div className="mt-1 text-xs text-gray-400">{formatDateTime(request.workOrder.scheduledAt)}</div>

                <Link to={`/app/work-orders/${request.workOrder.id}`} className="mt-5 inline-flex text-sm font-semibold text-gray-950 hover:underline">
                  Buka Work Order →
                </Link>
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-gray-500">Belum ada Work Order yang terhubung dengan Service Request ini.</p>
            )}
          </section>

          {canDecide ? (
            <section className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="font-semibold text-gray-950">Review Request</h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">Tambahkan catatan jika diperlukan. Untuk penolakan, alasan wajib diisi.</p>

              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Catatan Admin..."
                className="mt-5 w-full resize-none rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              />

              <div className="mt-2 text-right text-xs text-gray-400">{notes.length}/1000</div>

              <div className="mt-5 space-y-2">
                {canReview ? (
                  <button
                    type="button"
                    disabled={statusMutation.isPending}
                    onClick={() => {
                      void handleStatusChange('UNDER_REVIEW');
                    }}
                    className="h-10 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                  >
                    Mulai Review
                  </button>
                ) : null}

                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    void handleStatusChange('ACCEPTED');
                  }}
                  className="h-10 w-full rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  Terima Request
                </button>

                <button
                  type="button"
                  disabled={statusMutation.isPending}
                  onClick={() => {
                    void handleStatusChange('REJECTED');
                  }}
                  className="h-10 w-full rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                >
                  Tolak Request
                </button>
              </div>

              {statusMutation.isError ? <p className="mt-4 text-sm text-red-600">{statusMutation.error instanceof Error ? statusMutation.error.message : 'Status gagal diperbarui.'}</p> : null}
            </section>
          ) : null}

          {request.status === 'ACCEPTED' && !request.workOrder ? (
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="font-semibold text-emerald-900">Request diterima</h3>

              <p className="mt-2 text-sm leading-6 text-emerald-700">Service Request siap dilanjutkan ke proses Work Order dan penugasan technician.</p>
            </section>
          ) : null}

          {request.status === 'REJECTED' ? (
            <section className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="font-semibold text-red-900">Request ditolak</h3>

              <p className="mt-2 text-sm leading-6 text-red-700">Status ini bersifat final untuk proses review.</p>
            </section>
          ) : null}

          {request.status === 'CANCELLED' ? (
            <section className="rounded-2xl border border-gray-200 bg-gray-100 p-5">
              <h3 className="font-semibold text-gray-800">Dibatalkan Customer</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">Request ini tidak dapat dilanjutkan oleh Admin.</p>
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
