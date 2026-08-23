import Feather from '@expo/vector-icons/Feather';

import { useCallback, useEffect, useState } from 'react';

import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { WorkOrderCard } from '../../src/components/work-order-card';

import { useAuth } from '../../src/context/auth-context';

import { fetchTechnicianWorkOrders } from '../../src/services/work-order.service';

import type { TechnicianWorkOrder, WorkOrderListMeta, WorkOrderStatus } from '../../src/types/work-order';

type StatusFilter = 'ALL' | WorkOrderStatus;

type StatusFilterOption = {
  value: StatusFilter;
  label: string;
};

const PAGE_SIZE = 10;

const statusFilters: StatusFilterOption[] = [
  {
    value: 'ALL',
    label: 'Semua',
  },
  {
    value: 'ASSIGNED',
    label: 'Ditugaskan',
  },
  {
    value: 'ON_THE_WAY',
    label: 'Perjalanan',
  },
  {
    value: 'IN_PROGRESS',
    label: 'Dikerjakan',
  },
  {
    value: 'COMPLETED',
    label: 'Selesai',
  },
];

const emptyMeta: WorkOrderListMeta = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
};

export default function TechnicianHomeScreen() {
  const { user, signOut } = useAuth();

  const [workOrders, setWorkOrders] = useState<TechnicianWorkOrder[]>([]);

  const [meta, setMeta] = useState<WorkOrderListMeta>(emptyMeta);

  const [searchInput, setSearchInput] = useState('');

  const [appliedSearch, setAppliedSearch] = useState('');

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('ALL');

  const [isLoading, setIsLoading] = useState(true);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadWorkOrders = useCallback(
    async (page: number, mode: 'replace' | 'append' = 'replace') => {
      const response = await fetchTechnicianWorkOrders({
        page,
        limit: PAGE_SIZE,

        search: appliedSearch || undefined,

        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
      });

      if (mode === 'append') {
        setWorkOrders((current) => [...current, ...response.data]);
      } else {
        setWorkOrders(response.data);
      }

      setMeta(response.meta);
    },
    [appliedSearch, selectedStatus],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await fetchTechnicianWorkOrders({
          page: 1,
          limit: PAGE_SIZE,

          search: appliedSearch || undefined,

          status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        });

        if (cancelled) {
          return;
        }

        setWorkOrders(response.data);

        setMeta(response.meta);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Daftar tugas gagal dimuat');
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
  }, [appliedSearch, selectedStatus]);

  async function handleRefresh() {
    try {
      setIsRefreshing(true);
      setErrorMessage(null);

      await loadWorkOrders(1, 'replace');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Daftar tugas gagal diperbarui');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleLoadMore() {
    if (isLoading || isRefreshing || isLoadingMore) {
      return;
    }

    if (meta.page >= meta.totalPages) {
      return;
    }

    try {
      setIsLoadingMore(true);

      await loadWorkOrders(meta.page + 1, 'append');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Tugas berikutnya gagal dimuat');
    } finally {
      setIsLoadingMore(false);
    }
  }

  function handleSearchSubmit() {
    setAppliedSearch(searchInput.trim());
  }

  function handleClearSearch() {
    setSearchInput('');
    setAppliedSearch('');
  }

  function handleStatusChange(status: StatusFilter) {
    setSelectedStatus(status);
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#111827" />

          <Text style={styles.loadingMessage}>Memuat daftar tugas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <FlatList
        data={workOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkOrderCard workOrder={item} />}
        contentContainerStyle={[styles.listContent, workOrders.length === 0 && styles.emptyListContent]}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
          />
        }
        onEndReached={() => {
          void handleLoadMore();
        }}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Text style={styles.eyebrow}>TEKNISI</Text>

                <Text style={styles.title}>Halo, {user?.name}</Text>

                <Text style={styles.subtitle}>Berikut pekerjaan yang ditugaskan untuk kamu.</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
                onPress={() => {
                  void signOut();
                }}
              >
                <Feather name="log-out" size={19} color="#374151" />
              </Pressable>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{meta.total}</Text>

                <Text style={styles.summaryLabel}>Total tugas</Text>
              </View>
            </View>

            <View style={styles.searchContainer}>
              <Feather name="search" size={18} color="#9CA3AF" />

              <TextInput
                value={searchInput}
                onChangeText={setSearchInput}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                placeholder="Cari nomor atau judul tugas"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="none"
                style={styles.searchInput}
              />

              {searchInput ? (
                <Pressable onPress={handleClearSearch} hitSlop={10}>
                  <Feather name="x" size={18} color="#6B7280" />
                </Pressable>
              ) : null}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
              {statusFilters.map((filter) => {
                const isActive = filter.value === selectedStatus;

                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => {
                      handleStatusChange(filter.value);
                    }}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Feather name="alert-circle" size={18} color="#B91C1C" />

                <Text style={styles.errorText}>{errorMessage}</Text>

                <Pressable
                  onPress={() => {
                    void handleRefresh();
                  }}
                >
                  <Text style={styles.retryText}>Coba lagi</Text>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daftar tugas</Text>

              <Text style={styles.resultCount}>{meta.total} tugas</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Feather name="clipboard" size={28} color="#6B7280" />
            </View>

            <Text style={styles.emptyTitle}>Belum ada tugas</Text>

            <Text style={styles.emptyDescription}>Tidak ada Work Order yang sesuai dengan pencarian atau filter saat ini.</Text>
          </View>
        }
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loadMore}>
              <ActivityIndicator color="#111827" />

              <Text style={styles.loadMoreText}>Memuat tugas berikutnya...</Text>
            </View>
          ) : (
            <View style={styles.footerSpace} />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 24,
  },

  headerContent: {
    flex: 1,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#6B7280',
  },

  title: {
    marginTop: 5,
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },

  subtitle: {
    marginTop: 7,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },

  logoutButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  pressed: {
    opacity: 0.65,
  },

  summaryRow: {
    marginBottom: 18,
  },

  summaryCard: {
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 13,
    color: '#6B7280',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  searchInput: {
    flex: 1,
    height: '100%',
    marginHorizontal: 10,
    fontSize: 15,
    color: '#111827',
  },

  filterContainer: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 20,
  },

  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },

  filterChipActive: {
    borderColor: '#111827',
    backgroundColor: '#111827',
  },

  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#B91C1C',
  },

  retryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#991B1B',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  resultCount: {
    fontSize: 13,
    color: '#9CA3AF',
  },

  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loadingMessage: {
    marginTop: 14,
    fontSize: 14,
    color: '#6B7280',
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 60,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },

  emptyTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  emptyDescription: {
    marginTop: 7,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },

  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },

  loadMoreText: {
    fontSize: 13,
    color: '#6B7280',
  },

  footerSpace: {
    height: 12,
  },
});
