import { Pressable, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import type { ServiceRequestListItem } from '../types/service-request';

import { formatDateTime, getServiceRequestStatusLabel } from '../utils/service-request';

type Props = {
  request: ServiceRequestListItem;
};

export function ServiceRequestCard({ request }: Props) {
  function openDetails() {
    router.push({
      pathname: '/customer/requests/[serviceRequestId]',

      params: {
        serviceRequestId: request.id,
      },
    });
  }

  return (
    <Pressable onPress={openDetails} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.topRow}>
        <Text style={styles.requestNumber}>{request.requestNumber}</Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getServiceRequestStatusLabel(request.status)}</Text>
        </View>
      </View>

      <Text style={styles.serviceType}>{request.serviceType}</Text>

      <Text numberOfLines={2} style={styles.title}>
        {request.title}
      </Text>

      <View style={styles.divider} />

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.metaLabel}>DIBUAT</Text>

          <Text style={styles.metaValue}>{formatDateTime(request.createdAt)}</Text>
        </View>

        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  pressed: {
    opacity: 0.75,
  },

  topRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    gap: 12,
  },

  requestNumber: {
    flex: 1,

    color: '#6B7280',

    fontSize: 11,

    fontWeight: '700',
  },

  statusBadge: {
    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: '#F3F4F6',
  },

  statusText: {
    color: '#374151',

    fontSize: 10,

    fontWeight: '800',
  },

  serviceType: {
    marginTop: 18,

    color: '#111827',

    fontSize: 12,

    fontWeight: '700',
  },

  title: {
    marginTop: 5,

    color: '#111827',

    fontSize: 18,

    lineHeight: 24,

    fontWeight: '800',
  },

  divider: {
    height: 1,

    marginVertical: 16,

    backgroundColor: '#F0F1F3',
  },

  bottomRow: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  metaLabel: {
    color: '#9CA3AF',

    fontSize: 9,

    fontWeight: '700',
  },

  metaValue: {
    marginTop: 4,

    color: '#6B7280',

    fontSize: 11,
  },

  arrow: {
    color: '#111827',

    fontSize: 21,

    fontWeight: '700',
  },
});
