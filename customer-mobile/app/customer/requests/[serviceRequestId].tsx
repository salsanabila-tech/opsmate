import { useCallback, useEffect, useRef, useState } from 'react';

import { ActivityIndicator, Alert, AppState, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { cancelMyServiceRequest, getMyServiceRequest } from '../../../src/services/service-request.service';

import type { ServiceRequestDetail } from '../../../src/types/service-request';

import { WorkOrderProgress } from '../../../src/components/work-order-progress';

import { canCancelServiceRequest, formatDateTime, getServiceRequestStatusLabel, getWorkOrderStatusLabel, isWorkOrderTerminalStatus } from '../../../src/utils/service-request';

export default function ServiceRequestDetailScreen() {
  const params = useLocalSearchParams<{
    serviceRequestId: string | string[];
  }>();

  const serviceRequestId = Array.isArray(params.serviceRequestId) ? params.serviceRequestId[0] : params.serviceRequestId;

  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [cancelling, setCancelling] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const requestInFlight = useRef(false);

  const [liveUpdating, setLiveUpdating] = useState(false);

  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const [syncError, setSyncError] = useState<string | null>(null);

  const loadDetails = useCallback(
    async (
      options: {
        silent?: boolean;
      } = {},
    ): Promise<void> => {
      const silent = options.silent ?? false;

      if (!serviceRequestId) {
        setErrorMessage('Service Request ID tidak valid.');

        setLoading(false);

        return;
      }

      if (requestInFlight.current) {
        return;
      }

      requestInFlight.current = true;

      if (silent) {
        setLiveUpdating(true);
      }

      try {
        if (!silent) {
          setErrorMessage(null);
        }

        const response = await getMyServiceRequest(serviceRequestId);

        setRequest(response.data.serviceRequest);

        setLastSyncedAt(new Date());

        setSyncError(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Detail permintaan gagal dimuat.';

        if (silent) {
          setSyncError(message);
        } else {
          setErrorMessage(message);
        }
      } finally {
        requestInFlight.current = false;

        setLoading(false);

        setRefreshing(false);

        setLiveUpdating(false);
      }
    },
    [serviceRequestId],
  );

  useEffect(() => {
    void loadDetails();
  }, [loadDetails]);

  const shouldAutoTrack = request !== null && request.status !== 'REJECTED' && request.status !== 'CANCELLED' && (!request.workOrder || !isWorkOrderTerminalStatus(request.workOrder.status));

  useEffect(() => {
    if (!shouldAutoTrack) {
      return;
    }

    function refreshIfActive() {
      if (AppState.currentState === 'active') {
        void loadDetails({
          silent: true,
        });
      }
    }

    const intervalId = setInterval(refreshIfActive, 10_000);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void loadDetails({
          silent: true,
        });
      }
    });

    return () => {
      clearInterval(intervalId);

      subscription.remove();
    };
  }, [loadDetails, shouldAutoTrack]);

  function confirmCancel() {
    if (!request || cancelling) {
      return;
    }

    Alert.alert('Batalkan permintaan?', 'Permintaan yang sudah dibatalkan tidak dapat diproses lagi.', [
      {
        text: 'Tidak',

        style: 'cancel',
      },

      {
        text: 'Ya, Batalkan',

        style: 'destructive',

        onPress: () => {
          void handleCancel();
        },
      },
    ]);
  }

  async function handleCancel(): Promise<void> {
    if (!serviceRequestId) {
      return;
    }

    try {
      setCancelling(true);

      await cancelMyServiceRequest(serviceRequestId);

      await loadDetails();
    } catch (error) {
      Alert.alert('Gagal membatalkan', error instanceof Error ? error.message : 'Terjadi kesalahan.');
    } finally {
      setCancelling(false);
    }
  }

  async function handleRefresh() {
    if (requestInFlight.current) {
      return;
    }

    setRefreshing(true);

    await loadDetails();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Memuat detail...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMessage || !request) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Detail tidak tersedia</Text>

          <Text style={styles.errorText}>{errorMessage ?? 'Service request tidak ditemukan.'}</Text>

          <Pressable
            onPress={() => {
              router.back();
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Kembali</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = canCancelServiceRequest(request.status);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => {
              router.back();
            }}
            style={styles.backButton}
          >
            <Text style={styles.backText}>←</Text>
          </Pressable>

          <Text style={styles.eyebrow}>DETAIL PERMINTAAN</Text>
        </View>

        <Text selectable style={styles.requestNumber}>
          {request.requestNumber}
        </Text>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getServiceRequestStatusLabel(request.status)}</Text>
        </View>

        <Text style={styles.title}>{request.title}</Text>

        <Text style={styles.serviceType}>{request.serviceType}</Text>

        <View style={styles.liveCard}>
          <View style={[styles.liveDot, shouldAutoTrack ? styles.liveDotActive : styles.liveDotIdle]} />

          <View style={styles.liveContent}>
            <Text style={styles.liveTitle}>{shouldAutoTrack ? 'Live tracking aktif' : 'Tracking selesai'}</Text>

            <Text style={syncError ? styles.liveError : styles.liveSubtitle}>
              {syncError
                ? 'Sinkronisasi terbaru gagal. Data terakhir tetap ditampilkan.'
                : lastSyncedAt
                  ? `Terakhir diperbarui ${lastSyncedAt.toLocaleTimeString('id-ID', {
                      hour: '2-digit',

                      minute: '2-digit',

                      second: '2-digit',
                    })}`
                  : 'Menunggu sinkronisasi...'}
            </Text>
          </View>

          {liveUpdating ? <ActivityIndicator size="small" /> : null}
        </View>

        <Section title="Informasi Permintaan">
          <InfoRow label="Deskripsi" value={request.description} />

          <InfoRow label="Alamat Service" value={request.serviceAddress} />

          <InfoRow label="Nomor Kontak" value={request.contactPhone} />

          <InfoRow label="Jadwal Diinginkan" value={request.preferredSchedule ? formatDateTime(request.preferredSchedule) : 'Tidak ditentukan'} />

          <InfoRow label="Dibuat" value={formatDateTime(request.createdAt)} />
        </Section>

        <Section title="Work Order">
          {request.workOrder ? (
            <>
              <InfoRow label="Nomor Work Order" value={request.workOrder.workOrderNumber} />

              <InfoRow label="Status" value={getWorkOrderStatusLabel(request.workOrder.status)} />

              <InfoRow label="Jadwal" value={formatDateTime(request.workOrder.scheduledAt)} />

              <InfoRow label="Teknisi" value={request.workOrder.technician?.name ?? 'Belum ditentukan'} />

              {request.workOrder.completedAt ? <InfoRow label="Selesai" value={formatDateTime(request.workOrder.completedAt)} /> : null}
            </>
          ) : (
            <Text style={styles.emptySection}>Work Order belum dibuat oleh Admin.</Text>
          )}
        </Section>

        {request.workOrder ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress Pekerjaan</Text>

            <WorkOrderProgress workOrder={request.workOrder} />
          </View>
        ) : null}

        <Section title="Timeline Status">
          {request.statusHistories.map((history, index) => (
            <View key={history.id} style={styles.timelineRow}>
              <View style={styles.timelineIndicator}>
                <View style={styles.timelineDot} />

                {index < request.statusHistories.length - 1 ? <View style={styles.timelineLine} /> : null}
              </View>

              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>{getServiceRequestStatusLabel(history.newStatus)}</Text>

                <Text style={styles.timelineDate}>{formatDateTime(history.createdAt)}</Text>

                {history.notes ? <Text style={styles.timelineNotes}>{history.notes}</Text> : null}

                <Text style={styles.timelineActor}>Oleh {history.changedBy.name}</Text>
              </View>
            </View>
          ))}
        </Section>

        {canCancel ? (
          <Pressable disabled={cancelling} onPress={confirmCancel} style={styles.cancelButton}>
            {cancelling ? <ActivityIndicator /> : <Text style={styles.cancelText}>Batalkan Permintaan</Text>}
          </Pressable>
        ) : null}
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
  label: string;

  value: string;
};

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text selectable style={styles.infoValue}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor: '#F7F7F8',
  },

  content: {
    paddingHorizontal: 24,

    paddingTop: 18,

    paddingBottom: 48,
  },

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 14,
  },

  backButton: {
    width: 40,

    height: 40,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  backText: {
    color: '#111827',

    fontSize: 22,
  },

  eyebrow: {
    color: '#6B7280',

    fontSize: 11,

    fontWeight: '700',

    letterSpacing: 1,
  },

  requestNumber: {
    marginTop: 30,

    color: '#9CA3AF',

    fontSize: 11,

    fontWeight: '700',
  },

  statusBadge: {
    alignSelf: 'flex-start',

    marginTop: 12,

    paddingHorizontal: 11,

    paddingVertical: 7,

    borderRadius: 999,

    backgroundColor: '#E5E7EB',
  },

  statusText: {
    color: '#374151',

    fontSize: 11,

    fontWeight: '800',
  },

  title: {
    marginTop: 18,

    color: '#111827',

    fontSize: 28,

    lineHeight: 34,

    fontWeight: '800',

    letterSpacing: -0.6,
  },

  serviceType: {
    marginTop: 7,

    color: '#6B7280',

    fontSize: 14,

    fontWeight: '600',
  },

  section: {
    marginTop: 30,
  },

  sectionTitle: {
    marginBottom: 10,

    color: '#111827',

    fontSize: 14,

    fontWeight: '800',
  },

  sectionCard: {
    paddingHorizontal: 18,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  infoRow: {
    paddingVertical: 16,

    borderBottomWidth: 1,

    borderBottomColor: '#F0F1F3',
  },

  infoLabel: {
    color: '#9CA3AF',

    fontSize: 10,

    fontWeight: '700',

    textTransform: 'uppercase',
  },

  infoValue: {
    marginTop: 6,

    color: '#111827',

    fontSize: 14,

    lineHeight: 21,

    fontWeight: '600',
  },

  emptySection: {
    paddingVertical: 20,

    color: '#6B7280',

    fontSize: 13,

    lineHeight: 20,
  },

  timelineRow: {
    flexDirection: 'row',

    paddingTop: 18,
  },

  timelineIndicator: {
    width: 24,

    alignItems: 'center',
  },

  timelineDot: {
    width: 10,

    height: 10,

    borderRadius: 999,

    backgroundColor: '#111827',
  },

  timelineLine: {
    width: 2,

    flex: 1,

    marginTop: 6,

    backgroundColor: '#E5E7EB',
  },

  timelineContent: {
    flex: 1,

    paddingLeft: 10,

    paddingBottom: 24,
  },

  timelineTitle: {
    color: '#111827',

    fontSize: 14,

    fontWeight: '800',
  },

  timelineDate: {
    marginTop: 4,

    color: '#9CA3AF',

    fontSize: 11,
  },

  timelineNotes: {
    marginTop: 8,

    color: '#4B5563',

    fontSize: 13,

    lineHeight: 19,
  },

  timelineActor: {
    marginTop: 6,

    color: '#9CA3AF',

    fontSize: 10,
  },

  cancelButton: {
    minHeight: 52,

    marginTop: 28,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: '#FCA5A5',

    borderRadius: 12,

    backgroundColor: '#FEF2F2',
  },

  cancelText: {
    color: '#B91C1C',

    fontSize: 14,

    fontWeight: '800',
  },

  center: {
    flex: 1,

    paddingHorizontal: 30,

    alignItems: 'center',

    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,

    color: '#6B7280',
  },

  errorTitle: {
    color: '#111827',

    fontSize: 19,

    fontWeight: '800',
  },

  errorText: {
    marginTop: 8,

    textAlign: 'center',

    color: '#6B7280',

    lineHeight: 20,
  },

  primaryButton: {
    marginTop: 20,

    paddingHorizontal: 20,

    paddingVertical: 12,

    borderRadius: 10,

    backgroundColor: '#111827',
  },

  primaryButtonText: {
    color: '#FFFFFF',

    fontWeight: '700',
  },

  liveCard: {
    marginTop: 22,

    padding: 14,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 14,

    backgroundColor: '#FFFFFF',
  },

  liveDot: {
    width: 9,

    height: 9,

    borderRadius: 999,
  },

  liveDotActive: {
    backgroundColor: '#16A34A',
  },

  liveDotIdle: {
    backgroundColor: '#9CA3AF',
  },

  liveContent: {
    flex: 1,

    marginLeft: 10,

    marginRight: 10,
  },

  liveTitle: {
    color: '#111827',

    fontSize: 12,

    fontWeight: '800',
  },

  liveSubtitle: {
    marginTop: 3,

    color: '#9CA3AF',

    fontSize: 10,
  },

  liveError: {
    marginTop: 3,

    color: '#B91C1C',

    fontSize: 10,

    lineHeight: 15,
  },
});
