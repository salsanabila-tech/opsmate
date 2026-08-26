import { useState } from 'react';

import { Link } from 'expo-router';

import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../src/context/auth-context';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
};

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  password: '',
};

export default function RegisterScreen() {
  const { signUp } = useAuth();

  const [form, setForm] = useState<FormState>(initialForm);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({
      ...current,

      [field]: value,
    }));
  }

  function validateForm(): string | null {
    if (form.name.trim().length < 2) {
      return 'Nama minimal 2 karakter.';
    }

    if (!form.email.includes('@')) {
      return 'Format email tidak valid.';
    }

    if (form.phone.trim().length < 8) {
      return 'Nomor telepon minimal 8 karakter.';
    }

    if (form.address.trim().length < 5) {
      return 'Alamat minimal 5 karakter.';
    }

    if (form.password.length < 8) {
      return 'Password minimal 8 karakter.';
    }

    return null;
  }

  async function handleRegister() {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);

      return;
    }

    try {
      setSubmitting(true);

      setErrorMessage(null);

      await signUp({
        name: form.name,

        email: form.email,

        phone: form.phone,

        address: form.address,

        password: form.password,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Registrasi gagal.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.eyebrow}>OPSMATE CUSTOMER</Text>

          <Text style={styles.title}>Buat akun</Text>

          <Text style={styles.subtitle}>Daftar untuk membuat permintaan service dan memantau progresnya.</Text>

          <View style={styles.form}>
            <Field label="Nama" value={form.name} placeholder="Nama lengkap" editable={!submitting} onChangeText={(value) => updateField('name', value)} />

            <Field label="Email" value={form.email} placeholder="customer@example.com" editable={!submitting} autoCapitalize="none" keyboardType="email-address" onChangeText={(value) => updateField('email', value)} />

            <Field label="Nomor Telepon" value={form.phone} placeholder="081234567890" editable={!submitting} keyboardType="phone-pad" onChangeText={(value) => updateField('phone', value)} />

            <View>
              <Text style={styles.label}>Alamat</Text>

              <TextInput value={form.address} onChangeText={(value) => updateField('address', value)} placeholder="Alamat lengkap" multiline editable={!submitting} textAlignVertical="top" style={[styles.input, styles.addressInput]} />
            </View>

            <Field label="Password" value={form.password} placeholder="Minimal 8 karakter" editable={!submitting} secureTextEntry onChangeText={(value) => updateField('password', value)} />

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={submitting}
              onPress={() => {
                void handleRegister();
              }}
              style={({ pressed }) => [styles.button, pressed && !submitting && styles.buttonPressed, submitting && styles.buttonDisabled]}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Buat Akun</Text>}
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun?</Text>

            <Link href="/auth/login" style={styles.loginLink}>
              Masuk
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  placeholder: string;

  editable: boolean;

  onChangeText: (value: string) => void;

  keyboardType?: 'default' | 'email-address' | 'phone-pad';

  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';

  secureTextEntry?: boolean;
};

function Field({ label, value, placeholder, editable, onChangeText, keyboardType = 'default', autoCapitalize = 'sentences', secureTextEntry = false }: FieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} editable={editable} keyboardType={keyboardType} autoCapitalize={autoCapitalize} secureTextEntry={secureTextEntry} style={styles.input} />
    </View>
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

    paddingTop: 28,

    paddingBottom: 36,
  },

  eyebrow: {
    color: '#6B7280',

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1.1,
  },

  title: {
    marginTop: 14,

    color: '#111827',

    fontSize: 34,

    fontWeight: '800',

    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 10,

    maxWidth: 320,

    color: '#6B7280',

    fontSize: 15,

    lineHeight: 23,
  },

  form: {
    marginTop: 34,

    gap: 18,
  },

  label: {
    marginBottom: 8,

    color: '#374151',

    fontSize: 13,

    fontWeight: '600',
  },

  input: {
    minHeight: 52,

    paddingHorizontal: 16,

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',

    color: '#111827',

    fontSize: 15,
  },

  addressInput: {
    height: 96,

    paddingTop: 14,
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

  loginRow: {
    marginTop: 24,

    flexDirection: 'row',

    justifyContent: 'center',

    gap: 6,
  },

  loginText: {
    color: '#6B7280',

    fontSize: 14,
  },

  loginLink: {
    color: '#111827',

    fontSize: 14,

    fontWeight: '700',
  },
});
