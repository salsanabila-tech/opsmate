import type { ServiceRequestStatus } from '../types/service-request';

const statusConfig: Record<
  ServiceRequestStatus,
  {
    label: string;
    className: string;
  }
> = {
  SUBMITTED: {
    label: 'Submitted',

    className: 'bg-gray-100 text-gray-700 ring-gray-200',
  },

  UNDER_REVIEW: {
    label: 'Under Review',

    className: 'bg-amber-50 text-amber-700 ring-amber-200',
  },

  ACCEPTED: {
    label: 'Accepted',

    className: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },

  REJECTED: {
    label: 'Rejected',

    className: 'bg-red-50 text-red-700 ring-red-200',
  },

  CANCELLED: {
    label: 'Cancelled',

    className: 'bg-gray-100 text-gray-500 ring-gray-200',
  },

  CONVERTED: {
    label: 'Converted',

    className: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
};

export function ServiceRequestStatusBadge({ status }: { status: ServiceRequestStatus }) {
  const config = statusConfig[status];

  return <span className={['inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', config.className].join(' ')}>{config.label}</span>;
}
