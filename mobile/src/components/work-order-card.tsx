import Feather from '@expo/vector-icons/Feather';

import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TechnicianWorkOrder } from '../types/work-order';

import { formatWorkOrderDate } from '../utils/date';

import { WorkOrderStatusBadge } from './work-order-status-badge';

type Props = {
  workOrder: TechnicianWorkOrder;
  onPress?: () => void;
};

export function WorkOrderCard({ workOrder, onPress }: Props) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [styles.card, pressed && onPress && styles.cardPressed]}>
      <View style={styles.header}>
        <Text style={styles.workOrderNumber} numberOfLines={1}>
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

      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Feather name="user" size={15} color="#6B7280" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Customer</Text>

          <Text style={styles.infoValue} numberOfLines={1}>
            {workOrder.customer.name}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.iconContainer}>
          <Feather name="calendar" size={15} color="#6B7280" />
        </View>

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Jadwal</Text>

          <Text style={styles.infoValue}>{formatWorkOrderDate(workOrder.scheduledAt)}</Text>
        </View>
      </View>

      {workOrder.customer.address ? (
        <View style={styles.infoRow}>
          <View style={styles.iconContainer}>
            <Feather name="map-pin" size={15} color="#6B7280" />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Lokasi</Text>

            <Text style={styles.infoValue} numberOfLines={2}>
              {workOrder.customer.address}
            </Text>
          </View>
        </View>
      ) : null}
    </Pressable>
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

  cardPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  workOrderNumber: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
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

  iconContainer: {
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
