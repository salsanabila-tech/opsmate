import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileText, ImageIcon, Mail, MapPin, Phone, RefreshCw, UserRound, Wrench } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';

import { Link, useParams } from 'react-router-dom';

import type { ComponentType, ReactNode } from 'react';

import { WorkOrderStatusBadge } from '../components/work-order-status-badge';

import { fetchWorkOrderDetail } from '../services/work-order.service';

import { formatDateTime } from '../utils/date';

import { formatFileSize } from '../utils/file-size';

import { resolveFileUrl } from '../utils/file-url';

export function WorkOrderDetailPage() {
  const { workOrderId } = useParams<{
    workOrderId: string;
  }>();

  const detailQuery = useQuery({
    queryKey: ['work-order', workOrderId],

    queryFn: () => {
      if (!workOrderId) {
        throw new Error('Work Order ID tidak valid');
      }

      return fetchWorkOrderDetail(workOrderId);
    },

    enabled: Boolean(workOrderId),
  });

  if (detailQuery.isPending) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gray-400" />

          <p className="mt-3 text-sm text-gray-500">Memuat detail Work Order...</p>
        </div>
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div>
        <Link to="/app/work-orders" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-950">
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Work Orders
        </Link>

        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
          <h2 className="font-semibold text-red-800">Detail Work Order gagal dimuat</h2>

          <p className="mt-2 text-sm text-red-600">{detailQuery.error instanceof Error ? detailQuery.error.message : 'Terjadi kesalahan.'}</p>

          <button
            type="button"
            onClick={() => {
              void detailQuery.refetch();
            }}
            className="mt-5 rounded-xl bg-red-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const workOrder = detailQuery.data.data;

  return (
    <>
      <header>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <Link to="/app/work-orders" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-950">
              <ArrowLeft className="h-4 w-4" />
              Work Orders
            </Link>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{workOrder.workOrderNumber}</h1>

              <WorkOrderStatusBadge status={workOrder.status} />
            </div>

            <p className="mt-3 text-lg font-medium text-gray-700">{workOrder.title}</p>
          </div>

          <button
            type="button"
            disabled={detailQuery.isFetching}
            onClick={() => {
              void detailQuery.refetch();
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={['h-4 w-4', detailQuery.isFetching ? 'animate-spin' : ''].join(' ')} />
            Refresh
          </button>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <Section title="Informasi Pekerjaan">
            <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">{workOrder.description}</p>

            <div className="mt-6 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2">
              <InfoItem icon={CalendarDays} label="Jadwal" value={formatDateTime(workOrder.scheduledAt)} />

              <InfoItem icon={Clock3} label="Dibuat" value={formatDateTime(workOrder.createdAt)} />

              <InfoItem icon={RefreshCw} label="Terakhir diperbarui" value={formatDateTime(workOrder.updatedAt)} />

              <InfoItem icon={CheckCircle2} label="Diselesaikan" value={workOrder.completedAt ? formatDateTime(workOrder.completedAt) : 'Belum selesai'} />
            </div>
          </Section>

          <Section title={`Evidence (${workOrder.attachments.length})`}>
            {workOrder.attachments.length === 0 ? (
              <EmptyState icon={ImageIcon} title="Belum ada evidence" description="Technician belum mengunggah attachment untuk Work Order ini." />
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {workOrder.attachments.map((attachment) => {
                  const fileUrl = resolveFileUrl(attachment.fileUrl);

                  return (
                    <article key={attachment.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                      <a href={fileUrl} target="_blank" rel="noreferrer" className="group block aspect-[16/10] overflow-hidden bg-gray-100">
                        <img src={fileUrl} alt={attachment.description ?? attachment.fileName} className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]" />
                      </a>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <EvidenceBadge type={attachment.attachmentType} />

                          <span className="text-xs text-gray-400">{formatFileSize(attachment.fileSize)}</span>
                        </div>

                        <p className="mt-3 truncate text-sm font-semibold text-gray-900">{attachment.fileName}</p>

                        {attachment.description ? <p className="mt-2 text-sm leading-6 text-gray-500">{attachment.description}</p> : null}

                        <div className="mt-4 border-t border-gray-100 pt-3 text-xs leading-5 text-gray-400">
                          <p>Uploaded by {attachment.uploadedBy.name}</p>

                          <p>{formatDateTime(attachment.createdAt)}</p>
                        </div>

                        <a href={fileUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-950">
                          Buka gambar
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </Section>

          <Section title="Riwayat Status">
            {workOrder.statusHistories.length === 0 ? (
              <EmptyState icon={Clock3} title="Belum ada riwayat" description="Riwayat perubahan status belum tersedia." />
            ) : (
              <div>
                {workOrder.statusHistories.map((history, index) => {
                  const isLast = index === workOrder.statusHistories.length - 1;

                  return (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex w-6 flex-col items-center">
                        <div className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-gray-950" />

                        {!isLast ? <div className="my-1 w-px flex-1 bg-gray-200" /> : null}
                      </div>

                      <div className={['flex-1', isLast ? '' : 'pb-8'].join(' ')}>
                        <div className="flex flex-wrap items-center gap-2">
                          <WorkOrderStatusBadge status={history.newStatus} />

                          <span className="text-xs text-gray-400">{formatDateTime(history.createdAt)}</span>
                        </div>

                        <p className="mt-3 text-sm font-medium text-gray-800">Oleh {history.changedBy.name}</p>

                        <p className="mt-1 text-xs text-gray-400">{history.changedBy.role}</p>

                        {history.notes ? <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">{history.notes}</div> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-6">
          <Section title="Customer">
            <InfoItem icon={UserRound} label="Nama" value={workOrder.customer.name} />

            <InfoItem icon={Phone} label="Telepon" value={workOrder.customer.phone} />

            <InfoItem icon={Mail} label="Email" value={workOrder.customer.email ?? '-'} />

            <InfoItem icon={MapPin} label="Alamat" value={workOrder.customer.address} />

            {workOrder.customer.notes ? <InfoItem icon={FileText} label="Catatan" value={workOrder.customer.notes} /> : null}
          </Section>

          <Section title="Technician">
            {workOrder.technician ? (
              <>
                <InfoItem icon={Wrench} label="Nama" value={workOrder.technician.name} />

                <InfoItem icon={Mail} label="Email" value={workOrder.technician.email} />

                <InfoItem icon={Phone} label="Telepon" value={workOrder.technician.phone ?? '-'} />

                <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs font-medium text-gray-400">Status akun</p>

                  <p className={['mt-1 text-sm font-semibold', workOrder.technician.isActive ? 'text-emerald-700' : 'text-red-700'].join(' ')}>{workOrder.technician.isActive ? 'Aktif' : 'Tidak aktif'}</p>
                </div>
              </>
            ) : (
              <EmptyState icon={Wrench} title="Belum ditugaskan" description="Work Order ini belum memiliki technician." />
            )}
          </Section>

          <Section title="Dibuat Oleh">
            <InfoItem icon={UserRound} label="Nama" value={workOrder.createdBy.name} />

            <InfoItem icon={Mail} label="Email" value={workOrder.createdBy.email} />

            <InfoItem icon={FileText} label="Role" value={workOrder.createdBy.role} />
          </Section>
        </aside>
      </div>
    </>
  );
}

type SectionProps = {
  title: string;
  children: ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <h2 className="text-base font-semibold text-gray-950">{title}</h2>

      <div className="mt-5">{children}</div>
    </section>
  );
}

type IconComponent = ComponentType<{
  className?: string;
}>;

type InfoItemProps = {
  icon: IconComponent;

  label: string;

  value: string;
};

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="mb-4 flex gap-3 last:mb-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-4 w-4 text-gray-500" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400">{label}</p>

        <p className="mt-1 break-words text-sm font-medium leading-6 text-gray-700">{value}</p>
      </div>
    </div>
  );
}

type EvidenceBadgeProps = {
  type: 'BEFORE' | 'AFTER' | 'OTHER';
};

function EvidenceBadge({ type }: EvidenceBadgeProps) {
  const className = type === 'BEFORE' ? 'bg-blue-50 text-blue-700' : type === 'AFTER' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600';

  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>{type}</span>;
}

type EmptyStateProps = {
  icon: IconComponent;

  title: string;

  description: string;
};

function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="py-8 text-center">
      <Icon className="mx-auto h-7 w-7 text-gray-300" />

      <p className="mt-3 text-sm font-semibold text-gray-700">{title}</p>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">{description}</p>
    </div>
  );
}
