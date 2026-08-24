import { StyleSheet, Text, View } from 'react-native';

import type { WorkOrderStatusHistory } from '../types/work-order';

import { formatWorkOrderDate } from '../utils/date';

import { getWorkOrderStatusLabel } from '../utils/work-order';

type Props = {
  history: WorkOrderStatusHistory;
  isLast: boolean;
};

export function WorkOrderTimelineItem({ history, isLast }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.timeline}>
        <View style={styles.dot} />

        {!isLast ? <View style={styles.line} /> : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.status}>{getWorkOrderStatusLabel(history.newStatus)}</Text>

        <Text style={styles.date}>{formatWorkOrderDate(history.createdAt)}</Text>

        <Text style={styles.actor}>Oleh {history.changedBy.name}</Text>

        {history.notes ? <Text style={styles.notes}>{history.notes}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    minHeight: 82,
  },

  timeline: {
    width: 28,
    alignItems: 'center',
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#111827',
  },

  line: {
    flex: 1,
    width: 2,
    marginVertical: 5,
    backgroundColor: '#E5E7EB',
  },

  content: {
    flex: 1,
    paddingBottom: 20,
  },

  status: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  date: {
    marginTop: 3,
    fontSize: 12,
    color: '#9CA3AF',
  },

  actor: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },

  notes: {
    marginTop: 7,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    fontSize: 13,
    lineHeight: 19,
    color: '#4B5563',
  },
});
