import { useState } from 'react';

import { router } from 'expo-router';

import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '../../src/context/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage('Email dan password wajib diisi');

      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await signIn(email, password);

      router.replace('/');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>O</Text>
            </View>

            <Text style={styles.brand}>OpsMate</Text>
          </View>

          <Text style={styles.title}>Selamat datang</Text>

          <Text style={styles.subtitle}>Masuk untuk mengelola pekerjaan dan aktivitas servis.</Text>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Email</Text>

              <TextInput value={email} onChangeText={setEmail} placeholder="nama@email.com" keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!isSubmitting} style={styles.input} />
            </View>

            <View>
              <Text style={styles.label}>Password</Text>

              <TextInput value={password} onChangeText={setPassword} placeholder="Masukkan password" secureTextEntry autoCapitalize="none" editable={!isSubmitting} style={styles.input} />
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={isSubmitting}
              onPress={() => {
                void handleLogin();
              }}
              style={({ pressed }) => [styles.loginButton, pressed && !isSubmitting && styles.loginButtonPressed, isSubmitting && styles.loginButtonDisabled]}
            >
              {isSubmitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>Masuk</Text>}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F7F7F8',
  },

  keyboard: {
    flex: 1,
  },

  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },

  logo: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  brand: {
    marginLeft: 12,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },

  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: '#6B7280',
  },

  form: {
    marginTop: 32,
    gap: 20,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  input: {
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    color: '#111827',
  },

  errorBox: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
  },

  errorText: {
    fontSize: 14,
    color: '#B91C1C',
  },

  loginButton: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#111827',
  },

  loginButtonPressed: {
    opacity: 0.85,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
