import type { ServiceRequestStatus } from '../types/service-request';

const statusLabels: Record<ServiceRequestStatus, string> = {
  SUBMITTED: 'Dikirim',

  UNDER_REVIEW: 'Sedang Ditinjau',

  ACCEPTED: 'Diterima',

  REJECTED: 'Ditolak',

  CANCELLED: 'Dibatalkan',

  CONVERTED: 'Diproses',
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
