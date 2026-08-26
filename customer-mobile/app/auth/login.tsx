import { useState } from 'react';

import { Link } from 'expo-router';

import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/context/auth-context';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setErrorMessage('Email dan password wajib diisi.');

      return;
    }

    try {
      setSubmitting(true);

      setErrorMessage(null);

      await signIn(email, password);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Login gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>O</Text>
            </View>

            <Text style={styles.brandName}>OpsMate</Text>

            <Text style={styles.brandType}>Customer</Text>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Selamat datang</Text>

            <Text style={styles.subtitle}>Masuk untuk memesan dan memantau layanan Anda.</Text>
          </View>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Email</Text>

              <TextInput value={email} onChangeText={setEmail} placeholder="customer@example.com" autoCapitalize="none" autoCorrect={false} keyboardType="email-address" editable={!submitting} style={styles.input} />
            </View>

            <View>
              <Text style={styles.label}>Password</Text>

              <TextInput value={password} onChangeText={setPassword} placeholder="Minimal 8 karakter" secureTextEntry editable={!submitting} style={styles.input} />
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={submitting}
              onPress={() => {
                void handleLogin();
              }}
              style={({ pressed }) => [styles.button, pressed && !submitting && styles.buttonPressed, submitting && styles.buttonDisabled]}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Masuk</Text>}
            </Pressable>
          </View>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun?</Text>

            <Link href="/auth/register" style={styles.registerLink}>
              Daftar
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  screen: {
    flex: 1,

    backgroundColor: '#F7F7F8',
  },

  content: {
    flexGrow: 1,

    paddingHorizontal: 24,

    paddingTop: 32,

    paddingBottom: 32,
  },

  brand: {
    flexDirection: 'row',

    alignItems: 'center',
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
    color: '#FFFFFF',

    fontSize: 19,

    fontWeight: '800',
  },

  brandName: {
    marginLeft: 10,

    color: '#111827',

    fontSize: 17,

    fontWeight: '700',
  },

  brandType: {
    marginLeft: 6,

    color: '#9CA3AF',

    fontSize: 12,
  },

  header: {
    marginTop: 70,
  },

  title: {
    color: '#111827',

    fontSize: 34,

    fontWeight: '800',

    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 12,

    maxWidth: 310,

    color: '#6B7280',

    fontSize: 15,

    lineHeight: 23,
  },

  form: {
    marginTop: 42,

    gap: 20,
  },

  label: {
    marginBottom: 8,

    color: '#374151',

    fontSize: 13,

    fontWeight: '600',
  },

  input: {
    height: 52,

    paddingHorizontal: 16,

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',

    color: '#111827',

    fontSize: 15,
  },

  errorBox: {
    padding: 13,

    borderRadius: 10,

    backgroundColor: '#FEF2F2',
  },

  errorText: {
    color: '#B91C1C',

    fontSize: 13,

    lineHeight: 19,
  },

  button: {
    height: 52,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#111827',
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#FFFFFF',

    fontSize: 15,

    fontWeight: '700',
  },

  registerRow: {
    marginTop: 26,

    flexDirection: 'row',

    justifyContent: 'center',

    gap: 6,
  },

  registerText: {
    color: '#6B7280',

    fontSize: 14,
  },

  registerLink: {
    color: '#111827',

    fontSize: 14,

    fontWeight: '700',
  },
});
