import { useEffect, useState } from 'react';

import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { router } from 'expo-router';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ServiceRequestCard } from '../../../src/components/service-request-card';

import { listMyServiceRequests } from '../../../src/services/service-request.service';

import type { ServiceRequestListItem, ServiceRequestPagination, ServiceRequestStatus } from '../../../src/types/service-request';

import { getServiceRequestStatusLabel } from '../../../src/utils/service-request';

type StatusFilter = ServiceRequestStatus | 'all';

const filters: StatusFilter[] = ['all', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'CONVERTED'];

function getFilterLabel(status: StatusFilter): string {
  if (status === 'all') {
    return 'Semua';
  }

  return getServiceRequestStatusLabel(status);
}

export default function RequestsScreen() {
  const [requests, setRequests] = useState<ServiceRequestListItem[]>([]);

  const [pagination, setPagination] = useState<ServiceRequestPagination | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadRequests(reset: boolean): Promise<void> {
    const targetPage = reset ? 1 : (pagination?.page ?? 0) + 1;

    try {
      if (reset) {
        setErrorMessage(null);
      }

      const response = await listMyServiceRequests({
        page: targetPage,

        limit: 20,

        status: statusFilter,
      });

      setRequests((current) => (reset ? response.data.serviceRequests : [...current, ...response.data.serviceRequests]));

      setPagination(response.data.pagination);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Daftar permintaan gagal dimuat.');
    } finally {
      setLoading(false);

      setRefreshing(false);

      setLoadingMore(false);
    }
  }

  useEffect(() => {
    setLoading(true);

    setRequests([]);

    setPagination(null);

    void loadRequests(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function handleRefresh() {
    setRefreshing(true);

    await loadRequests(true);
  }

  async function handleLoadMore() {
    if (!pagination?.hasNextPage || loadingMore) {
      return;
    }

    setLoadingMore(true);

    await loadRequests(false);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            router.back();
          }}
          style={styles.backButton}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View>
          <Text style={styles.eyebrow}>OPSMATE CUSTOMER</Text>

          <Text style={styles.headerTitle}>Permintaan Saya</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters} style={styles.filterScroll}>
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setStatusFilter(filter);
            }}
            style={[styles.filter, filter === statusFilter && styles.filterActive]}
          >
            <Text style={[styles.filterText, filter === statusFilter && styles.filterTextActive]}>{getFilterLabel(filter)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>Memuat permintaan...</Text>
        </View>
      ) : errorMessage && requests.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>Gagal memuat data</Text>

          <Text style={styles.errorText}>{errorMessage}</Text>

          <Pressable
            onPress={() => {
              setLoading(true);

              void loadRequests(true);
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => (
            <View
              style={{
                height: 12,
              }}
            />
          )}
          renderItem={({ item }) => <ServiceRequestCard request={item} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                void handleRefresh();
              }}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Belum ada permintaan</Text>

              <Text style={styles.emptyText}>Permintaan service yang Anda buat akan muncul di sini.</Text>

              <Pressable
                onPress={() => {
                  router.push('/customer/request-new');
                }}
                style={styles.newButton}
              >
                <Text style={styles.newButtonText}>Buat Permintaan</Text>
              </Pressable>
            </View>
          }
          ListFooterComponent={
            pagination?.hasNextPage ? (
              <Pressable
                disabled={loadingMore}
                onPress={() => {
                  void handleLoadMore();
                }}
                style={styles.loadMoreButton}
              >
                {loadingMore ? <ActivityIndicator /> : <Text style={styles.loadMoreText}>Muat Lebih Banyak</Text>}
              </Pressable>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor: '#F7F7F8',
  },

  header: {
    paddingHorizontal: 24,

    paddingTop: 16,

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
    color: '#9CA3AF',

    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 1,
  },

  headerTitle: {
    marginTop: 3,

    color: '#111827',

    fontSize: 22,

    fontWeight: '800',
  },

  filterScroll: {
    flexGrow: 0,

    marginTop: 22,
  },

  filters: {
    paddingHorizontal: 24,

    gap: 8,
  },

  filter: {
    paddingHorizontal: 14,

    paddingVertical: 9,

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  filterActive: {
    borderColor: '#111827',

    backgroundColor: '#111827',
  },

  filterText: {
    color: '#6B7280',

    fontSize: 12,

    fontWeight: '700',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  list: {
    flexGrow: 1,

    paddingHorizontal: 24,

    paddingTop: 20,

    paddingBottom: 36,
  },

  center: {
    flex: 1,

    paddingHorizontal: 32,

    alignItems: 'center',

    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,

    color: '#6B7280',

    fontSize: 13,
  },

  errorTitle: {
    color: '#111827',

    fontSize: 18,

    fontWeight: '800',
  },

  errorText: {
    marginTop: 8,

    textAlign: 'center',

    color: '#6B7280',

    fontSize: 13,

    lineHeight: 20,
  },

  retryButton: {
    marginTop: 20,

    paddingHorizontal: 20,

    paddingVertical: 12,

    borderRadius: 10,

    backgroundColor: '#111827',
  },

  retryText: {
    color: '#FFFFFF',

    fontWeight: '700',
  },

  empty: {
    flex: 1,

    paddingVertical: 80,

    alignItems: 'center',
  },

  emptyTitle: {
    color: '#111827',

    fontSize: 18,

    fontWeight: '800',
  },

  emptyText: {
    marginTop: 8,

    maxWidth: 270,

    textAlign: 'center',

    color: '#6B7280',

    fontSize: 13,

    lineHeight: 20,
  },

  newButton: {
    marginTop: 20,

    paddingHorizontal: 18,

    paddingVertical: 12,

    borderRadius: 10,

    backgroundColor: '#111827',
  },

  newButtonText: {
    color: '#FFFFFF',

    fontSize: 13,

    fontWeight: '700',
  },

  loadMoreButton: {
    marginTop: 18,

    height: 48,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  loadMoreText: {
    color: '#111827',

    fontSize: 13,

    fontWeight: '700',
  },
});
