import type { WorkOrderStatus } from '../types/work-order';

export function getWorkOrderStatusLabel(status: WorkOrderStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Pending';

    case 'ASSIGNED':
      return 'Ditugaskan';

    case 'ON_THE_WAY':
      return 'Dalam Perjalanan';

    case 'IN_PROGRESS':
      return 'Dikerjakan';

    case 'COMPLETED':
      return 'Selesai';

    case 'CANCELLED':
      return 'Dibatalkan';

    default:
      return status;
  }
}
