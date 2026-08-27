import type { ServiceRequestStatus, WorkOrderStatus } from '../types/service-request';

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: 'Dikirim',

  UNDER_REVIEW: 'Sedang Ditinjau',

  ACCEPTED: 'Diterima',

  REJECTED: 'Ditolak',

  CANCELLED: 'Dibatalkan',

  CONVERTED: 'Diproses',
};

const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  PENDING: 'Menunggu Penugasan',

  ASSIGNED: 'Teknisi Ditugaskan',

  ON_THE_WAY: 'Teknisi Menuju Lokasi',

  IN_PROGRESS: 'Sedang Dikerjakan',

  COMPLETED: 'Selesai',

  CANCELLED: 'Dibatalkan',
};

export function getServiceRequestStatusLabel(status: ServiceRequestStatus): string {
  return statusLabels[status];
}

export function canCancelServiceRequest(status: ServiceRequestStatus): boolean {
  return status === 'SUBMITTED' || status === 'UNDER_REVIEW';
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString('id-ID', {
    day: '2-digit',

    month: 'short',

    year: 'numeric',

    hour: '2-digit',

    minute: '2-digit',
  });
}

export function getWorkOrderStatusLabel(status: WorkOrderStatus): string {
  return workOrderStatusLabels[status];
}

export function isWorkOrderTerminalStatus(status: WorkOrderStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED';
}
