import Feather from '@expo/vector-icons/Feather';

import { StyleSheet, Text, View } from 'react-native';

import type { AdminWorkOrderListItem } from '../types/admin';

import { formatWorkOrderDate } from '../utils/date';

import { WorkOrderStatusBadge } from './work-order-status-badge';

type Props = {
  workOrder: AdminWorkOrderListItem;
};

export function AdminWorkOrderCard({ workOrder }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.number} numberOfLines={1}>
          {workOrder.workOrderNumber}
        </Text>

        <WorkOrderStatusBadge status={workOrder.status} />
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {workOrder.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {workOrder.description}
      </Text>

      <View style={styles.divider} />

      <InfoRow icon="user" label="Customer" value={workOrder.customer.name} />

      <InfoRow icon="tool" label="Teknisi" value={workOrder.technician ? workOrder.technician.name : 'Belum ditugaskan'} />

      <InfoRow icon="calendar" label="Jadwal" value={formatWorkOrderDate(workOrder.scheduledAt)} />
    </View>
  );
}

type InfoRowProps = {
  icon: React.ComponentProps<typeof Feather>['name'];

  label: string;

  value: string;
};

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.icon}>
        <Feather name={icon} size={15} color="#6B7280" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>

        <Text style={styles.infoValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  number: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  title: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    color: '#111827',
  },

  description: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: '#F3F4F6',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  icon: {
    width: 30,
    paddingTop: 2,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  infoValue: {
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#374151',
  },
});
