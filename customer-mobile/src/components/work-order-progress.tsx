import { StyleSheet, Text, View } from 'react-native';

import type { ServiceRequestWorkOrder, WorkOrderStatus } from '../types/service-request';

import { formatDateTime, getWorkOrderStatusLabel } from '../utils/service-request';

type Props = {
  workOrder: ServiceRequestWorkOrder;
};

type ProgressStatus = 'ASSIGNED' | 'ON_THE_WAY' | 'IN_PROGRESS' | 'COMPLETED';

type ProgressStep = {
  status: ProgressStatus;

  label: string;

  description: string;
};

const steps: ProgressStep[] = [
  {
    status: 'ASSIGNED',

    label: 'Teknisi ditugaskan',

    description: 'Teknisi sudah menerima tugas service.',
  },

  {
    status: 'ON_THE_WAY',

    label: 'Menuju lokasi',

    description: 'Teknisi sedang menuju lokasi service.',
  },

  {
    status: 'IN_PROGRESS',

    label: 'Sedang dikerjakan',

    description: 'Proses service sedang berlangsung.',
  },

  {
    status: 'COMPLETED',

    label: 'Selesai',

    description: 'Pekerjaan service telah selesai.',
  },
];

function getCurrentStepIndex(status: WorkOrderStatus): number {
  switch (status) {
    case 'ASSIGNED':
      return 0;

    case 'ON_THE_WAY':
      return 1;

    case 'IN_PROGRESS':
      return 2;

    case 'COMPLETED':
      return 3;

    default:
      return -1;
  }
}

export function WorkOrderProgress({ workOrder }: Props) {
  if (workOrder.status === 'CANCELLED') {
    return (
      <View style={styles.cancelledCard}>
        <Text style={styles.cancelledTitle}>Work Order dibatalkan</Text>

        <Text style={styles.cancelledText}>Pekerjaan ini tidak lagi dilanjutkan.</Text>
      </View>
    );
  }

  if (workOrder.status === 'PENDING') {
    return (
      <View style={styles.pendingCard}>
        <Text style={styles.pendingTitle}>Menunggu technician</Text>

        <Text style={styles.pendingText}>Admin sedang menyiapkan penugasan technician.</Text>
      </View>
    );
  }

  const currentIndex = getCurrentStepIndex(workOrder.status);

  const historyByStatus = new Map<WorkOrderStatus, string>();

  for (const history of workOrder.statusHistories) {
    historyByStatus.set(history.newStatus, history.createdAt);
  }

  return (
    <View style={styles.card}>
      <View style={styles.currentHeader}>
        <Text style={styles.currentLabel}>STATUS SAAT INI</Text>

        <Text style={styles.currentValue}>{getWorkOrderStatusLabel(workOrder.status)}</Text>
      </View>

      <View style={styles.timeline}>
        {steps.map((step, index) => {
          const completed = index <= currentIndex;

          const current = index === currentIndex;

          const statusTime = historyByStatus.get(step.status);

          return (
            <View key={step.status} style={styles.step}>
              <View style={styles.indicatorColumn}>
                <View style={[styles.dot, completed ? styles.dotCompleted : styles.dotPending, current ? styles.dotCurrent : null]}>
                  <Text style={[styles.dotText, completed ? styles.dotTextCompleted : styles.dotTextPending]}>{index + 1}</Text>
                </View>

                {index < steps.length - 1 ? <View style={[styles.line, index < currentIndex ? styles.lineCompleted : styles.linePending]} /> : null}
              </View>

              <View style={styles.stepContent}>
                <Text style={[styles.stepTitle, completed ? styles.stepTitleCompleted : styles.stepTitlePending]}>{step.label}</Text>

                <Text style={styles.stepDescription}>{step.description}</Text>

                {statusTime ? <Text style={styles.stepTime}>{formatDateTime(statusTime)}</Text> : null}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  currentHeader: {
    paddingBottom: 18,

    borderBottomWidth: 1,

    borderBottomColor: '#F0F1F3',
  },

  currentLabel: {
    color: '#9CA3AF',

    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 1,
  },

  currentValue: {
    marginTop: 6,

    color: '#111827',

    fontSize: 18,

    fontWeight: '800',
  },

  timeline: {
    marginTop: 20,
  },

  step: {
    flexDirection: 'row',
  },

  indicatorColumn: {
    width: 34,

    alignItems: 'center',
  },

  dot: {
    width: 26,

    height: 26,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 999,
  },

  dotCompleted: {
    backgroundColor: '#111827',
  },

  dotPending: {
    borderWidth: 1,

    borderColor: '#D1D5DB',

    backgroundColor: '#FFFFFF',
  },

  dotCurrent: {
    borderWidth: 3,

    borderColor: '#D1D5DB',
  },

  dotText: {
    fontSize: 10,

    fontWeight: '800',
  },

  dotTextCompleted: {
    color: '#FFFFFF',
  },

  dotTextPending: {
    color: '#9CA3AF',
  },

  line: {
    width: 2,

    minHeight: 52,

    flex: 1,

    marginVertical: 4,
  },

  lineCompleted: {
    backgroundColor: '#111827',
  },

  linePending: {
    backgroundColor: '#E5E7EB',
  },

  stepContent: {
    flex: 1,

    paddingLeft: 10,

    paddingBottom: 24,
  },

  stepTitle: {
    fontSize: 14,

    fontWeight: '800',
  },

  stepTitleCompleted: {
    color: '#111827',
  },

  stepTitlePending: {
    color: '#9CA3AF',
  },

  stepDescription: {
    marginTop: 4,

    color: '#6B7280',

    fontSize: 12,

    lineHeight: 18,
  },

  stepTime: {
    marginTop: 6,

    color: '#9CA3AF',

    fontSize: 10,
  },

  cancelledCard: {
    padding: 18,

    borderWidth: 1,

    borderColor: '#FCA5A5',

    borderRadius: 16,

    backgroundColor: '#FEF2F2',
  },

  cancelledTitle: {
    color: '#991B1B',

    fontSize: 15,

    fontWeight: '800',
  },

  cancelledText: {
    marginTop: 6,

    color: '#B91C1C',

    fontSize: 12,

    lineHeight: 18,
  },

  pendingCard: {
    padding: 18,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  pendingTitle: {
    color: '#111827',

    fontSize: 15,

    fontWeight: '800',
  },

  pendingText: {
    marginTop: 6,

    color: '#6B7280',

    fontSize: 12,

    lineHeight: 18,
  },
});
