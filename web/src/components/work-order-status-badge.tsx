import type { WorkOrderStatus } from '../types/work.order';

type Props = {
  status: WorkOrderStatus;
};

const config: Record<
  WorkOrderStatus,
  {
    label: string;
    className: string;
  }
> = {
  PENDING: {
    label: 'Pending',

    className: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  },

  ASSIGNED: {
    label: 'Ditugaskan',

    className: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  },

  ON_THE_WAY: {
    label: 'Dalam Perjalanan',

    className: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  },

  IN_PROGRESS: {
    label: 'Dikerjakan',

    className: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  },

  COMPLETED: {
    label: 'Selesai',

    className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  },

  CANCELLED: {
    label: 'Dibatalkan',

    className: 'bg-red-50 text-red-700 ring-red-600/20',
  },
};

export function WorkOrderStatusBadge({ status }: Props) {
  const item = config[status];

  return <span className={['inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset', item.className].join(' ')}>{item.label}</span>;
}
