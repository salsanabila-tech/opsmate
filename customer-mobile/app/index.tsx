import { useEffect, useState } from 'react';

import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { checkApiHealth } from '../src/services/health.service';

type ConnectionStatus = 'checking' | 'connected' | 'failed';

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');

  const [message, setMessage] = useState('Memeriksa koneksi...');

  async function checkConnection() {
    try {
      setConnectionStatus('checking');

      setMessage('Memeriksa koneksi...');

      const response = await checkApiHealth();

      setConnectionStatus('connected');

      setMessage(response.message);
    } catch (error) {
      setConnectionStatus('failed');

      setMessage(error instanceof Error ? error.message : 'Koneksi gagal.');
    }
  }

  useEffect(() => {
    void checkConnection();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.brandRow}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>O</Text>
          </View>

          <View>
            <Text style={styles.brand}>OpsMate</Text>

            <Text style={styles.brandType}>Customer</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SERVICE MADE SIMPLE</Text>

          <Text style={styles.title}>Butuh bantuan service?</Text>

          <Text style={styles.description}>Pesan layanan, pantau teknisi, dan lihat progres pekerjaan langsung dari OpsMate.</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.statusHeader}>
            <Text style={styles.cardTitle}>Server Connection</Text>

            <View style={[styles.statusDot, connectionStatus === 'connected' ? styles.dotConnected : connectionStatus === 'failed' ? styles.dotFailed : styles.dotChecking]} />
          </View>

          <View style={styles.statusContent}>
            {connectionStatus === 'checking' ? <ActivityIndicator /> : null}

            <Text style={styles.statusText}>{message}</Text>
          </View>

          {connectionStatus === 'failed' ? (
            <Pressable
              onPress={() => {
                void checkConnection();
              }}
              style={styles.retryButton}
            >
              <Text style={styles.retryText}>Coba Lagi</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Customer authentication akan ditambahkan pada tahap berikutnya.</Text>
        </View>
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

    paddingHorizontal: 24,

    paddingTop: 24,

    paddingBottom: 24,
  },

  brandRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },

  logo: {
    width: 44,

    height: 44,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 14,

    backgroundColor: '#111827',
  },

  logoText: {
    fontSize: 21,

    fontWeight: '800',

    color: '#FFFFFF',
  },

  brand: {
    marginLeft: 12,

    fontSize: 18,

    fontWeight: '700',

    color: '#111827',
  },

  brandType: {
    marginLeft: 12,

    marginTop: 1,

    fontSize: 12,

    color: '#6B7280',
  },

  hero: {
    marginTop: 72,
  },

  eyebrow: {
    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.1,

    color: '#6B7280',
  },

  title: {
    marginTop: 14,

    maxWidth: 320,

    fontSize: 38,

    lineHeight: 44,

    fontWeight: '800',

    letterSpacing: -1,

    color: '#111827',
  },

  description: {
    marginTop: 18,

    maxWidth: 330,

    fontSize: 16,

    lineHeight: 25,

    color: '#6B7280',
  },

  card: {
    marginTop: 42,

    padding: 20,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 18,

    backgroundColor: '#FFFFFF',
  },

  statusHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent: 'space-between',
  },

  cardTitle: {
    fontSize: 14,

    fontWeight: '700',

    color: '#111827',
  },

  statusDot: {
    width: 9,

    height: 9,

    borderRadius: 999,
  },

  dotConnected: {
    backgroundColor: '#16A34A',
  },

  dotFailed: {
    backgroundColor: '#DC2626',
  },

  dotChecking: {
    backgroundColor: '#9CA3AF',
  },

  statusContent: {
    marginTop: 16,

    flexDirection: 'row',

    alignItems: 'center',

    gap: 10,
  },

  statusText: {
    flex: 1,

    fontSize: 14,

    lineHeight: 21,

    color: '#6B7280',
  },

  retryButton: {
    marginTop: 18,

    height: 44,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#111827',
  },

  retryText: {
    fontSize: 14,

    fontWeight: '700',

    color: '#FFFFFF',
  },

  footer: {
    marginTop: 'auto',
  },

  footerText: {
    textAlign: 'center',

    fontSize: 12,

    lineHeight: 18,

    color: '#9CA3AF',
  },
});
