import { useEffect, useState } from 'react';

import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { checkApiHealth } from '../src/services/api';

type ConnectionStatus = 'checking' | 'connected' | 'failed';

export default function IndexScreen() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');

  const [message, setMessage] = useState('Menghubungkan ke OpsMate API...');

  async function checkConnection() {
    try {
      setStatus('checking');
      setMessage('Menghubungkan ke OpsMate API...');

      const response = await checkApiHealth();

      setStatus('connected');
      setMessage(response.message);
    } catch (error) {
      console.error('API connection failed:', error);

      setStatus('failed');

      setMessage(error instanceof Error ? error.message : 'Tidak dapat terhubung ke API');
    }
  }

  useEffect(() => {
    void checkConnection();
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.brand}>OpsMate</Text>

        <Text style={styles.title}>Mobile Foundation</Text>

        <Text style={styles.description}>Memeriksa koneksi aplikasi mobile ke backend OpsMate.</Text>

        <View style={styles.statusCard}>
          {status === 'checking' ? <ActivityIndicator size="large" /> : <View style={[styles.statusDot, status === 'connected' ? styles.connectedDot : styles.failedDot]} />}

          <View style={styles.statusContent}>
            <Text style={styles.statusTitle}>{status === 'checking' ? 'Checking API' : status === 'connected' ? 'API Connected' : 'API Connection Failed'}</Text>

            <Text style={styles.statusMessage}>{message}</Text>
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => {
            void checkConnection();
          }}
        >
          <Text style={styles.buttonText}>Check Again</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F6F7F8',
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  brand: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '700',
  },

  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 10,
    marginBottom: 32,
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
  },

  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },

  connectedDot: {
    backgroundColor: '#16A34A',
  },

  failedDot: {
    backgroundColor: '#DC2626',
  },

  statusContent: {
    flex: 1,
  },

  statusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  statusMessage: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },

  button: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
