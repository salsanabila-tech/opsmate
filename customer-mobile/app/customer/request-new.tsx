import { useMemo, useState } from 'react';

import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { router } from 'expo-router';

import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../src/services/api';

import { createServiceRequest } from '../../src/services/service-request.service';

import type { ServiceRequest } from '../../src/types/service-request';

type FormState = {
  serviceType: string;

  title: string;

  description: string;

  serviceAddress: string;

  contactPhone: string;
};

const initialForm: FormState = {
  serviceType: '',

  title: '',

  description: '',

  serviceAddress: '',

  contactPhone: '',
};

const serviceTypes = ['Mesin Cuci', 'AC', 'Kulkas', 'Televisi', 'Elektronik', 'Lainnya'] as const;

type PickerMode = 'date' | 'time' | null;

function getDefaultSchedule(): Date {
  const date = new Date();

  date.setDate(date.getDate() + 1);

  date.setHours(10, 0, 0, 0);

  return date;
}

function padNumber(value: number): string {
  return String(value).padStart(2, '0');
}

function formatSchedule(date: Date): string {
  return [padNumber(date.getDate()), padNumber(date.getMonth() + 1), date.getFullYear()].join('/') + ` ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}`;
}

export default function CreateServiceRequestScreen() {
  const [form, setForm] = useState<FormState>(initialForm);

  const [customServiceType, setCustomServiceType] = useState('');

  const [preferredSchedule, setPreferredSchedule] = useState<Date | null>(null);

  const [pickerMode, setPickerMode] = useState<PickerMode>(null);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [createdRequest, setCreatedRequest] = useState<ServiceRequest | null>(null);

  const scheduleText = useMemo(() => (preferredSchedule ? formatSchedule(preferredSchedule) : 'Belum dipilih'), [preferredSchedule]);

  function updateField(field: keyof FormState, value: string): void {
    setForm((current) => ({
      ...current,

      [field]: value,
    }));
  }

  function validateForm(): string | null {
    if (form.serviceType.trim().length < 2) {
      return 'Jenis service wajib dipilih.';
    }

    if (form.serviceType === 'Lainnya' && customServiceType.trim().length < 2) {
      return 'Tuliskan jenis service.';
    }

    if (form.title.trim().length < 3) {
      return 'Judul masalah minimal 3 karakter.';
    }

    if (form.description.trim().length < 5) {
      return 'Deskripsi masalah minimal 5 karakter.';
    }

    if (form.serviceAddress.trim().length < 5) {
      return 'Alamat service minimal 5 karakter.';
    }

    if (form.contactPhone.trim().length < 8) {
      return 'Nomor telepon minimal 8 karakter.';
    }

    if (preferredSchedule && preferredSchedule.getTime() <= Date.now()) {
      return 'Jadwal service harus berada di masa depan.';
    }

    return null;
  }

  function handlePickerChange(event: DateTimePickerEvent, selectedDate?: Date): void {
    const currentMode = pickerMode;

    setPickerMode(null);

    if (event.type === 'dismissed' || !selectedDate || !currentMode) {
      return;
    }

    const baseDate = preferredSchedule ?? getDefaultSchedule();

    if (currentMode === 'date') {
      const updated = new Date(selectedDate);

      updated.setHours(baseDate.getHours(), baseDate.getMinutes(), 0, 0);

      setPreferredSchedule(updated);

      return;
    }

    const updated = new Date(baseDate);

    updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);

    setPreferredSchedule(updated);
  }

  async function handleSubmit(): Promise<void> {
    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);

      return;
    }

    const finalServiceType = form.serviceType === 'Lainnya' ? customServiceType.trim() : form.serviceType.trim();

    try {
      setSubmitting(true);

      setErrorMessage(null);

      const response = await createServiceRequest({
        serviceType: finalServiceType,

        title: form.title,

        description: form.description,

        serviceAddress: form.serviceAddress,

        contactPhone: form.contactPhone,

        preferredSchedule: preferredSchedule ? preferredSchedule.toISOString() : null,
      });

      setCreatedRequest(response.data.serviceRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        const firstValidationError = error.errors?.[0]?.message;

        setErrorMessage(firstValidationError ?? error.message);

        return;
      }

      setErrorMessage(error instanceof Error ? error.message : 'Permintaan service gagal dibuat.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm(): void {
    setForm(initialForm);

    setCustomServiceType('');

    setPreferredSchedule(null);

    setErrorMessage(null);

    setCreatedRequest(null);
  }

  if (createdRequest) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.successContainer}>
          <View style={styles.successMark}>
            <Text style={styles.successMarkText}>✓</Text>
          </View>

          <Text style={styles.successEyebrow}>PERMINTAAN TERKIRIM</Text>

          <Text style={styles.successTitle}>Service request berhasil dibuat</Text>

          <Text style={styles.successDescription}>Admin OpsMate akan memeriksa permintaan service Anda.</Text>

          <View style={styles.successCard}>
            <Text style={styles.summaryLabel}>Nomor Request</Text>

            <Text selectable style={styles.requestNumber}>
              {createdRequest.requestNumber}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.summaryLabel}>Service</Text>

            <Text style={styles.summaryValue}>{createdRequest.serviceType}</Text>

            <View style={styles.divider} />

            <Text style={styles.summaryLabel}>Status</Text>

            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{createdRequest.status}</Text>
            </View>
          </View>

          <Pressable
            onPress={() => {
              router.replace('/customer');
            }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>Kembali ke Beranda</Text>
          </Pressable>

          <Pressable onPress={resetForm} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Buat Permintaan Lagi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => {
                router.back();
              }}
              style={styles.backButton}
            >
              <Text style={styles.backText}>←</Text>
            </Pressable>

            <Text style={styles.headerLabel}>OPSMATE CUSTOMER</Text>
          </View>

          <Text style={styles.title}>Buat permintaan service</Text>

          <Text style={styles.subtitle}>Ceritakan masalah perangkat Anda agar admin dapat memproses layanan dengan tepat.</Text>

          <View style={styles.form}>
            <View>
              <Text style={styles.label}>Jenis Service</Text>

              <View style={styles.chipContainer}>
                {serviceTypes.map((serviceType) => (
                  <Pressable
                    key={serviceType}
                    onPress={() => {
                      updateField('serviceType', serviceType);

                      if (serviceType !== 'Lainnya') {
                        setCustomServiceType('');
                      }
                    }}
                    style={[styles.chip, form.serviceType === serviceType && styles.chipSelected]}
                  >
                    <Text style={[styles.chipText, form.serviceType === serviceType && styles.chipTextSelected]}>{serviceType}</Text>
                  </Pressable>
                ))}
              </View>

              {form.serviceType === 'Lainnya' ? <TextInput value={customServiceType} placeholder="Contoh: Pompa Air" editable={!submitting} onChangeText={setCustomServiceType} style={[styles.input, styles.otherInput]} /> : null}
            </View>

            <FormField label="Judul Masalah" value={form.title} placeholder="Contoh: Mesin cuci tidak berputar" editable={!submitting} onChangeText={(value) => updateField('title', value)} />

            <View>
              <Text style={styles.label}>Deskripsi Masalah</Text>

              <TextInput
                value={form.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Jelaskan gejala atau kerusakan yang terjadi..."
                multiline
                textAlignVertical="top"
                editable={!submitting}
                style={[styles.input, styles.descriptionInput]}
              />
            </View>

            <View>
              <Text style={styles.label}>Alamat Service</Text>

              <TextInput
                value={form.serviceAddress}
                onChangeText={(value) => updateField('serviceAddress', value)}
                placeholder="Alamat lengkap lokasi service"
                multiline
                textAlignVertical="top"
                editable={!submitting}
                style={[styles.input, styles.addressInput]}
              />
            </View>

            <FormField label="Nomor Kontak" value={form.contactPhone} placeholder="081234567890" editable={!submitting} keyboardType="phone-pad" onChangeText={(value) => updateField('contactPhone', value)} />

            <View>
              <Text style={styles.label}>Jadwal Diinginkan</Text>

              <Text style={styles.helperText}>Opsional. Jadwal final tetap akan dikonfirmasi oleh admin.</Text>

              <View style={styles.scheduleCard}>
                <Text style={styles.scheduleValue}>{scheduleText}</Text>

                <View style={styles.scheduleActions}>
                  <Pressable onPress={() => setPickerMode('date')} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>Tanggal</Text>
                  </Pressable>

                  <Pressable onPress={() => setPickerMode('time')} style={styles.smallButton}>
                    <Text style={styles.smallButtonText}>Jam</Text>
                  </Pressable>

                  {preferredSchedule ? (
                    <Pressable onPress={() => setPreferredSchedule(null)} style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>Hapus</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>

              {pickerMode ? <DateTimePicker value={preferredSchedule ?? getDefaultSchedule()} mode={pickerMode} minimumDate={pickerMode === 'date' ? new Date() : undefined} onChange={handlePickerChange} /> : null}
            </View>

            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable
              disabled={submitting}
              onPress={() => {
                void handleSubmit();
              }}
              style={({ pressed }) => [styles.primaryButton, pressed && !submitting && styles.pressed, submitting && styles.disabled]}
            >
              {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Kirim Permintaan</Text>}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FormFieldProps = {
  label: string;

  value: string;

  placeholder: string;

  editable: boolean;

  onChangeText: (value: string) => void;

  keyboardType?: 'default' | 'phone-pad';
};

function FormField({ label, value, placeholder, editable, onChangeText, keyboardType = 'default' }: FormFieldProps) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>

      <TextInput value={value} placeholder={placeholder} editable={editable} onChangeText={onChangeText} keyboardType={keyboardType} style={styles.input} />
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

    paddingTop: 18,

    paddingBottom: 40,
  },

  headerRow: {
    flexDirection: 'row',

    alignItems: 'center',

    gap: 12,
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

    lineHeight: 24,
  },

  headerLabel: {
    color: '#6B7280',

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1,
  },

  title: {
    marginTop: 34,

    color: '#111827',

    fontSize: 32,

    lineHeight: 38,

    fontWeight: '800',

    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 12,

    maxWidth: 340,

    color: '#6B7280',

    fontSize: 15,

    lineHeight: 23,
  },

  form: {
    marginTop: 34,

    gap: 22,
  },

  label: {
    marginBottom: 8,

    color: '#374151',

    fontSize: 13,

    fontWeight: '700',
  },

  helperText: {
    marginTop: -3,

    marginBottom: 10,

    color: '#9CA3AF',

    fontSize: 12,

    lineHeight: 18,
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

  otherInput: {
    marginTop: 12,
  },

  descriptionInput: {
    height: 130,

    paddingTop: 14,
  },

  addressInput: {
    height: 100,

    paddingTop: 14,
  },

  chipContainer: {
    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,
  },

  chip: {
    paddingHorizontal: 14,

    paddingVertical: 10,

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 999,

    backgroundColor: '#FFFFFF',
  },

  chipSelected: {
    borderColor: '#111827',

    backgroundColor: '#111827',
  },

  chipText: {
    color: '#4B5563',

    fontSize: 13,

    fontWeight: '600',
  },

  chipTextSelected: {
    color: '#FFFFFF',
  },

  scheduleCard: {
    padding: 16,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 14,

    backgroundColor: '#FFFFFF',
  },

  scheduleValue: {
    color: '#111827',

    fontSize: 15,

    fontWeight: '700',
  },

  scheduleActions: {
    marginTop: 14,

    flexDirection: 'row',

    flexWrap: 'wrap',

    gap: 8,
  },

  smallButton: {
    paddingHorizontal: 14,

    paddingVertical: 9,

    borderRadius: 9,

    backgroundColor: '#F3F4F6',
  },

  smallButtonText: {
    color: '#374151',

    fontSize: 12,

    fontWeight: '700',
  },

  clearButton: {
    paddingHorizontal: 14,

    paddingVertical: 9,

    borderRadius: 9,

    backgroundColor: '#FEF2F2',
  },

  clearButtonText: {
    color: '#B91C1C',

    fontSize: 12,

    fontWeight: '700',
  },

  errorBox: {
    padding: 14,

    borderRadius: 11,

    backgroundColor: '#FEF2F2',
  },

  errorText: {
    color: '#B91C1C',

    fontSize: 13,

    lineHeight: 20,
  },

  primaryButton: {
    minHeight: 52,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 12,

    backgroundColor: '#111827',
  },

  primaryButtonText: {
    color: '#FFFFFF',

    fontSize: 14,

    fontWeight: '700',
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.6,
  },

  secondaryButton: {
    minHeight: 50,

    marginTop: 12,

    alignItems: 'center',

    justifyContent: 'center',

    borderWidth: 1,

    borderColor: '#D1D5DB',

    borderRadius: 12,

    backgroundColor: '#FFFFFF',
  },

  secondaryButtonText: {
    color: '#111827',

    fontSize: 14,

    fontWeight: '700',
  },

  successContainer: {
    flex: 1,

    padding: 24,

    justifyContent: 'center',
  },

  successMark: {
    width: 52,

    height: 52,

    alignItems: 'center',

    justifyContent: 'center',

    borderRadius: 16,

    backgroundColor: '#111827',
  },

  successMarkText: {
    color: '#FFFFFF',

    fontSize: 25,

    fontWeight: '800',
  },

  successEyebrow: {
    marginTop: 24,

    color: '#6B7280',

    fontSize: 12,

    fontWeight: '700',

    letterSpacing: 1,
  },

  successTitle: {
    marginTop: 12,

    color: '#111827',

    fontSize: 30,

    lineHeight: 36,

    fontWeight: '800',

    letterSpacing: -0.7,
  },

  successDescription: {
    marginTop: 12,

    color: '#6B7280',

    fontSize: 15,

    lineHeight: 22,
  },

  successCard: {
    marginTop: 30,

    padding: 20,

    borderWidth: 1,

    borderColor: '#E5E7EB',

    borderRadius: 16,

    backgroundColor: '#FFFFFF',
  },

  summaryLabel: {
    color: '#9CA3AF',

    fontSize: 11,

    fontWeight: '700',

    textTransform: 'uppercase',
  },

  summaryValue: {
    marginTop: 6,

    color: '#111827',

    fontSize: 15,

    fontWeight: '700',
  },

  requestNumber: {
    marginTop: 6,

    color: '#111827',

    fontSize: 16,

    fontWeight: '800',
  },

  divider: {
    height: 1,

    marginVertical: 16,

    backgroundColor: '#F0F1F3',
  },

  statusBadge: {
    alignSelf: 'flex-start',

    marginTop: 8,

    paddingHorizontal: 10,

    paddingVertical: 6,

    borderRadius: 999,

    backgroundColor: '#F3F4F6',
  },

  statusText: {
    color: '#374151',

    fontSize: 11,

    fontWeight: '800',
  },
});
