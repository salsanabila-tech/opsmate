import Feather from '@expo/vector-icons/Feather';

import { router, useLocalSearchParams } from 'expo-router';

import { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkOrderAttachmentCard } from '../../../src/components/work-order-attachment-card';

import { WorkOrderStatusBadge } from '../../../src/components/work-order-status-badge';

import { WorkOrderTimelineItem } from '../../../src/components/work-order-timeline-item';

import { fetchTechnicianWorkOrderDetail } from '../../../src/services/work-order.service';

import type { TechnicianWorkOrderDetail } from '../../../src/types/work-order';

import { formatWorkOrderDate } from '../../../src/utils/date';

export default function TechnicianWorkOrderDetailScreen() {
  const { workOrderId } = useLocalSearchParams<{
    workOrderId: string;
  }>();

  const [workOrder, setWorkOrder] = useState<TechnicianWorkOrderDetail | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!workOrderId || Array.isArray(workOrderId)) {
      throw new Error('Work Order ID tidak valid');
    }

    const response = await fetchTechnicianWorkOrderDetail(workOrderId);

    setWorkOrder(response.data);
  }, [workOrderId]);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        if (!workOrderId || Array.isArray(workOrderId)) {
          throw new Error('Work Order ID tidak valid');
        }

        const response = await fetchTechnicianWorkOrderDetail(workOrderId);

        if (cancelled) {
          return;
        }

        setWorkOrder(response.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Detail pekerjaan gagal dimuat');
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [workOrderId]);

  async function handleRefresh() {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);

      await loadDetail();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Detail pekerjaan gagal diperbarui');
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#111827" />

          <Text style={styles.stateText}>Memuat detail pekerjaan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !workOrder) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.errorHeader}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#111827" />
          </Pressable>
        </View>

        <View style={styles.centerState}>
          <Feather name="alert-circle" size={40} color="#B91C1C" />

          <Text style={styles.errorTitle}>Detail tidak dapat dimuat</Text>

          <Text style={styles.stateText}>{errorMessage ?? 'Work Order tidak ditemukan'}</Text>

          <Pressable
            style={styles.retryButton}
            onPress={() => {
              void handleRefresh();
            }}
          >
            <Text style={styles.retryButtonText}>Coba lagi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
      >
        <View style={styles.topBar}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color="#111827" />
          </Pressable>

          <Text style={styles.topTitle}>Detail Tugas</Text>

          <View style={styles.topPlaceholder} />
        </View>

        <View style={styles.hero}>
          <View style={styles.heroHeader}>
            <Text style={styles.workOrderNumber}>{workOrder.workOrderNumber}</Text>

            <WorkOrderStatusBadge status={workOrder.status} />
          </View>

          <Text style={styles.title}>{workOrder.title}</Text>

          <Text style={styles.description}>{workOrder.description}</Text>
        </View>

        <Section title="Jadwal">
          <InfoRow icon="calendar" label="Waktu pekerjaan" value={formatWorkOrderDate(workOrder.scheduledAt)} />

          {workOrder.completedAt ? <InfoRow icon="check-circle" label="Diselesaikan" value={formatWorkOrderDate(workOrder.completedAt)} /> : null}
        </Section>

        <Section title="Customer">
          <InfoRow icon="user" label="Nama" value={workOrder.customer.name} />

          <InfoRow icon="phone" label="Telepon" value={workOrder.customer.phone ?? '-'} />

          <InfoRow icon="mail" label="Email" value={workOrder.customer.email ?? '-'} />

          <InfoRow icon="map-pin" label="Alamat" value={workOrder.customer.address ?? '-'} />

          {workOrder.customer.notes ? <InfoRow icon="file-text" label="Catatan customer" value={workOrder.customer.notes} /> : null}
        </Section>

        <Section title="Evidence">
          {workOrder.attachments.length > 0 ? workOrder.attachments.map((attachment) => <WorkOrderAttachmentCard key={attachment.id} attachment={attachment} />) : <EmptySection icon="image" text="Belum ada evidence untuk pekerjaan ini." />}
        </Section>

        <Section title="Riwayat Status">
          {workOrder.statusHistories.length > 0 ? (
            workOrder.statusHistories.map((history, index) => <WorkOrderTimelineItem key={history.id} history={history} isLast={index === workOrder.statusHistories.length - 1} />)
          ) : (
            <EmptySection icon="clock" text="Belum ada riwayat status." />
          )}
        </Section>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

function Section({ title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      <View style={styles.sectionCard}>{children}</View>
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
      <View style={styles.infoIcon}>
        <Feather name={icon} size={17} color="#6B7280" />
      </View>

      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>

        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

type EmptySectionProps = {
  icon: React.ComponentProps<typeof Feather>['name'];

  text: string;
};

function EmptySection({ icon, text }: EmptySectionProps) {
  return (
    <View style={styles.emptySection}>
      <Feather name={icon} size={23} color="#9CA3AF" />

      <Text style={styles.emptySectionText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
  },

  topTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  topPlaceholder: {
    width: 42,
  },

  hero: {
    marginTop: 10,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },

  workOrderNumber: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },

  title: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 31,
    color: '#111827',
  },

  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    marginBottom: 10,
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  sectionCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
  },

  infoIcon: {
    width: 34,
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
    marginTop: 3,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: '#374151',
  },

  emptySection: {
    alignItems: 'center',
    paddingVertical: 28,
  },

  emptySectionText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    color: '#9CA3AF',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  stateText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  errorHeader: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  errorTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  retryButtonText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },

  bottomSpace: {
    height: 20,
  },
});
