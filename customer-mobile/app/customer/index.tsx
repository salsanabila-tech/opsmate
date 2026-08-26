import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useState } from 'react';

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

        <View style={styles.nextCard}>
          <Text style={styles.nextTitle}>Selanjutnya</Text>

          <Text style={styles.nextText}>Pembuatan Service Request akan ditambahkan pada tahap 14I.5.</Text>
        </View>

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

  nextCard: {
    marginTop: 16,

    padding: 18,

    borderRadius: 16,

    backgroundColor: '#111827',
  },

  nextTitle: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '700',
  },

  nextText: {
    marginTop: 7,

    color: '#D1D5DB',

    fontSize: 13,

    lineHeight: 20,
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
