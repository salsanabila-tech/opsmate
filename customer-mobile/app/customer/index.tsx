import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';

import { Link } from 'expo-router';

import { useAuth } from '../../src/context/auth-context';

export default function CustomerHomeScreen() {
  const { user, signOut } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);

      await signOut();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View>
          <Text style={styles.label}>OPSMATE CUSTOMER</Text>

          <Text style={styles.title}>Halo, {user?.name}</Text>

          <Text style={styles.subtitle}>Akun Customer berhasil terhubung ke OpsMate.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Email</Text>

          <Text style={styles.cardValue}>{user?.email}</Text>

          <View style={styles.divider} />

          <Text style={styles.cardLabel}>Role</Text>

          <Text style={styles.cardValue}>{user?.role}</Text>

          <View style={styles.divider} />

          <Text style={styles.cardLabel}>Customer ID</Text>

          <Text selectable style={styles.customerId}>
            {user?.customerId}
          </Text>
        </View>

        <Link href="/customer/request-new" asChild>
          <Pressable style={styles.serviceCard}>
            <View>
              <Text style={styles.serviceEyebrow}>SERVICE REQUEST</Text>

              <Text style={styles.serviceTitle}>Butuh teknisi?</Text>

              <Text style={styles.serviceText}>Buat permintaan service baru dan jelaskan masalah perangkat Anda.</Text>
            </View>

            <View style={styles.serviceArrow}>
              <Text style={styles.serviceArrowText}>→</Text>
            </View>
          </Pressable>
        </Link>

        <Pressable
          disabled={loggingOut}
          onPress={() => {
            void handleLogout();
          }}
          style={styles.logoutButton}
        >
          {loggingOut ? <ActivityIndicator /> : <Text style={styles.logoutText}>Keluar</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,

    backgroundColor: '#F7F7F8',
  },

  container: {
    flex: 1,

    padding: 24,
  },

  label: {
    marginTop: 18,

    color: '#6B7280',

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1,
  },

  title: {
    marginTop: 12,

    color: '#111827',

    fontSize: 32,

    fontWeight: '800',

    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 10,

    color: '#6B7280',

    fontSize: 15,

    lineHeight: 23,
  },

  card: {
    marginTop: 36,

    padding: 20,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  cardLabel: {
    color: '#9CA3AF',

    fontSize: 11,

    fontWeight: '600',

    textTransform: 'uppercase',
  },

  cardValue: {
    marginTop: 5,

    color: '#111827',

    fontSize: 15,

    fontWeight: '600',
  },

  customerId: {
    marginTop: 5,

    color: '#4B5563',

    fontSize: 12,
  },

  divider: {
    height: 1,

    marginVertical: 17,

    backgroundColor: '#F0F1F3',
  },

  serviceCard: {
    marginTop: 18,

    padding: 20,

    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',

    borderRadius: 16,

    backgroundColor: '#111827',
  },

  serviceEyebrow: {
    color: '#9CA3AF',

    fontSize: 10,

    fontWeight: '700',

    letterSpacing: 1,
  },

  serviceTitle: {
    marginTop: 8,

    color: '#FFFFFF',

    fontSize: 20,

    fontWeight: '800',
  },

  serviceText: {
    marginTop: 7,

    maxWidth: 245,

    color: '#D1D5DB',

    fontSize: 13,

    lineHeight: 20,
  },

  serviceArrow: {
    width: 38,

    height: 38,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  serviceArrowText: {
    color: '#111827',

    fontSize: 21,

    fontWeight: '700',
  },

  logoutButton: {
    marginTop: 'auto',

    height: 50,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  logoutText: {
    color: '#111827',

    fontSize: 14,

    fontWeight: '700',
  },
});
