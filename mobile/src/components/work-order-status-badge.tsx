import { StyleSheet, Text, View } from 'react-native';

import type { WorkOrderStatus } from '../types/work-order';

import { getWorkOrderStatusLabel } from '../utils/work-order';

type Props = {
  status: WorkOrderStatus;
};

export function WorkOrderStatusBadge({ status }: Props) {
  return (
    <View style={[styles.badge, getBadgeStyle(status)]}>
      <Text style={[styles.text, getTextStyle(status)]}>{getWorkOrderStatusLabel(status)}</Text>
    </View>
  );
}

function getBadgeStyle(status: WorkOrderStatus) {
  switch (status) {
    case 'ASSIGNED':
      return styles.assignedBadge;

    case 'ON_THE_WAY':
      return styles.onTheWayBadge;

    case 'IN_PROGRESS':
      return styles.inProgressBadge;

    case 'COMPLETED':
      return styles.completedBadge;

    case 'CANCELLED':
      return styles.cancelledBadge;

    default:
      return styles.pendingBadge;
  }
}

function getTextStyle(status: WorkOrderStatus) {
  switch (status) {
    case 'ASSIGNED':
      return styles.assignedText;

    case 'ON_THE_WAY':
      return styles.onTheWayText;

    case 'IN_PROGRESS':
      return styles.inProgressText;

    case 'COMPLETED':
      return styles.completedText;

    case 'CANCELLED':
      return styles.cancelledText;

    default:
      return styles.pendingText;
  }
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },

  text: {
    fontSize: 11,
    fontWeight: '700',
  },

  pendingBadge: {
    backgroundColor: '#F3F4F6',
  },

  pendingText: {
    color: '#4B5563',
  },

  assignedBadge: {
    backgroundColor: '#DBEAFE',
  },

  assignedText: {
    color: '#1D4ED8',
  },

  onTheWayBadge: {
    backgroundColor: '#FEF3C7',
  },

  onTheWayText: {
    color: '#92400E',
  },

  inProgressBadge: {
    backgroundColor: '#EDE9FE',
  },

  inProgressText: {
    color: '#6D28D9',
  },

  completedBadge: {
    backgroundColor: '#DCFCE7',
  },

  completedText: {
    color: '#166534',
  },

  cancelledBadge: {
    backgroundColor: '#FEE2E2',
  },

  cancelledText: {
    color: '#B91C1C',
  },
});
