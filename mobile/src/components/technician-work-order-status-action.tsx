import Feather from '@expo/vector-icons/Feather';

import type { ComponentProps } from 'react';

import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { updateTechnicianWorkOrderStatus } from '../services/work-order.service';

import type { AttachmentType, TechnicianWorkOrderDetail, TechnicianWorkOrderNextStatus, WorkOrderStatus } from '../types/work-order';

import { useState } from 'react';

type Props = {
  workOrder: TechnicianWorkOrderDetail;

  onUpdated: () => Promise<void>;
};

type ActionConfig = {
  nextStatus: TechnicianWorkOrderNextStatus;

  title: string;

  description: string;

  buttonLabel: string;

  icon: ComponentProps<typeof Feather>['name'];

  requiredEvidence?: AttachmentType;
};

function getActionConfig(status: WorkOrderStatus): ActionConfig | null {
  switch (status) {
    case 'ASSIGNED':
      return {
        nextStatus: 'ON_THE_WAY',

        title: 'Mulai perjalanan',

        description: 'Konfirmasi bahwa kamu mulai menuju lokasi customer.',

        buttonLabel: 'Mulai Perjalanan',

        icon: 'navigation',
      };

    case 'ON_THE_WAY':
      return {
        nextStatus: 'IN_PROGRESS',

        title: 'Mulai pengerjaan',

        description: 'Pekerjaan dapat dimulai setelah evidence BEFORE tersedia.',

        buttonLabel: 'Mulai Pengerjaan',

        icon: 'tool',

        requiredEvidence: 'BEFORE',
      };

    case 'IN_PROGRESS':
      return {
        nextStatus: 'COMPLETED',

        title: 'Selesaikan pekerjaan',

        description: 'Work Order dapat diselesaikan setelah evidence AFTER tersedia.',

        buttonLabel: 'Selesaikan Pekerjaan',

        icon: 'check-circle',

        requiredEvidence: 'AFTER',
      };

    default:
      return null;
  }
}

export function TechnicianWorkOrderStatusAction({ workOrder, onUpdated }: Props) {
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const config = getActionConfig(workOrder.status);

  if (!config) {
    if (workOrder.status === 'COMPLETED') {
      return (
        <View style={styles.completedState}>
          <View style={styles.completedIcon}>
            <Feather name="check" size={22} color="#166534" />
          </View>

          <View style={styles.stateContent}>
            <Text style={styles.completedTitle}>Pekerjaan selesai</Text>

            <Text style={styles.stateDescription}>Work Order ini sudah selesai dan tidak memiliki aksi lanjutan.</Text>
          </View>
        </View>
      );
    }

    if (workOrder.status === 'CANCELLED') {
      return (
        <View style={styles.blockedState}>
          <Feather name="slash" size={20} color="#B91C1C" />

          <Text style={styles.blockedText}>Work Order telah dibatalkan.</Text>
        </View>
      );
    }

    return (
      <View style={styles.blockedState}>
        <Feather name="info" size={20} color="#6B7280" />

        <Text style={styles.blockedText}>Belum ada aksi yang dapat dilakukan untuk status ini.</Text>
      </View>
    );
  }

  const actionConfig: ActionConfig = config;

  const hasRequiredEvidence = !actionConfig.requiredEvidence || workOrder.attachments.some((attachment) => attachment.attachmentType === actionConfig.requiredEvidence);

  const evidenceMessage =
    actionConfig.requiredEvidence === 'BEFORE'
      ? 'Minimal satu evidence BEFORE wajib diunggah sebelum pekerjaan dimulai.'
      : actionConfig.requiredEvidence === 'AFTER'
        ? 'Minimal satu evidence AFTER wajib diunggah sebelum pekerjaan diselesaikan.'
        : null;

  async function submitStatusUpdate() {
    if (isSubmitting || !hasRequiredEvidence) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const response = await updateTechnicianWorkOrderStatus(workOrder.id, {
        status: actionConfig.nextStatus,

        notes: notes.trim() || undefined,
      });

      setNotes('');

      await onUpdated();

      Alert.alert('Status diperbarui', response.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Status Work Order gagal diperbarui');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePress() {
    if (!hasRequiredEvidence || isSubmitting) {
      return;
    }

    Alert.alert(actionConfig.title, `Status Work Order akan diubah menjadi ${actionConfig.nextStatus}. Lanjutkan?`, [
      {
        text: 'Batal',
        style: 'cancel',
      },

      {
        text: 'Lanjutkan',

        onPress: () => {
          void submitStatusUpdate();
        },
      },
    ]);
  }

  return (
    <View>
      <View style={styles.actionHeader}>
        <View style={styles.actionIcon}>
          <Feather name={actionConfig.icon} size={20} color="#111827" />
        </View>

        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>{actionConfig.title}</Text>

          <Text style={styles.actionDescription}>{actionConfig.description}</Text>
        </View>
      </View>

      {config.requiredEvidence ? (
        <View style={[styles.requirement, hasRequiredEvidence ? styles.requirementReady : styles.requirementMissing]}>
          <Feather name={hasRequiredEvidence ? 'check-circle' : 'alert-circle'} size={17} color={hasRequiredEvidence ? '#166534' : '#92400E'} />

          <View style={styles.requirementContent}>
            <Text style={[styles.requirementTitle, hasRequiredEvidence ? styles.readyText : styles.missingText]}>
              Evidence {actionConfig.requiredEvidence}
              {hasRequiredEvidence ? ' tersedia' : ' belum tersedia'}
            </Text>

            {!hasRequiredEvidence && evidenceMessage ? <Text style={styles.requirementDescription}>{evidenceMessage}</Text> : null}
          </View>
        </View>
      ) : null}

      <Text style={styles.inputLabel}>Catatan perubahan status</Text>

      <TextInput value={notes} onChangeText={setNotes} placeholder="Catatan opsional..." placeholderTextColor="#9CA3AF" multiline maxLength={1000} editable={!isSubmitting} style={styles.notesInput} />

      <Text style={styles.counter}>{notes.length}/1000</Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={17} color="#B91C1C" />

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={isSubmitting || !hasRequiredEvidence}
        onPress={handlePress}
        style={({ pressed }) => [styles.button, (!hasRequiredEvidence || isSubmitting) && styles.buttonDisabled, pressed && hasRequiredEvidence && !isSubmitting && styles.buttonPressed]}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Feather name={actionConfig.icon} size={18} color="#FFFFFF" />

            <Text style={styles.buttonText}>{actionConfig.buttonLabel}</Text>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  actionIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#F3F4F6',
  },

  actionContent: {
    flex: 1,
    marginLeft: 12,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  actionDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },

  requirementReady: {
    backgroundColor: '#F0FDF4',
  },

  requirementMissing: {
    backgroundColor: '#FFFBEB',
  },

  requirementContent: {
    flex: 1,
  },

  requirementTitle: {
    fontSize: 13,
    fontWeight: '700',
  },

  readyText: {
    color: '#166534',
  },

  missingText: {
    color: '#92400E',
  },

  requirementDescription: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    color: '#92400E',
  },

  inputLabel: {
    marginTop: 18,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  notesInput: {
    minHeight: 92,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },

  counter: {
    marginTop: 5,
    textAlign: 'right',
    fontSize: 11,
    color: '#9CA3AF',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 12,
    padding: 11,
    borderRadius: 11,
    backgroundColor: '#FEE2E2',
  },

  errorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#B91C1C',
  },

  button: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 13,
    backgroundColor: '#111827',
  },

  buttonDisabled: {
    opacity: 0.4,
  },

  buttonPressed: {
    opacity: 0.75,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  completedState: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  completedIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: '#DCFCE7',
  },

  completedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#166534',
  },

  stateContent: {
    flex: 1,
    marginLeft: 12,
  },

  stateDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  blockedState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 5,
  },

  blockedText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },
});
