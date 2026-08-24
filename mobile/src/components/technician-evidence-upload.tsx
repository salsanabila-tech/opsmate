import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';

import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useState } from 'react';

import { uploadTechnicianWorkOrderAttachment } from '../services/work-order.service';

import type { AttachmentType, TechnicianWorkOrderDetail, UploadWorkOrderAttachmentFile } from '../types/work-order';

type Props = {
  workOrder: TechnicianWorkOrderDetail;
  onUploaded: () => Promise<void>;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function getEvidenceType(workOrder: TechnicianWorkOrderDetail): AttachmentType | null {
  switch (workOrder.status) {
    case 'ON_THE_WAY':
      return 'BEFORE';

    case 'IN_PROGRESS':
      return 'AFTER';

    default:
      return null;
  }
}

function getMimeType(asset: ImagePicker.ImagePickerAsset): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  const declaredType = asset.mimeType?.toLowerCase();

  if (declaredType === 'image/jpeg' || declaredType === 'image/png' || declaredType === 'image/webp') {
    return declaredType;
  }

  const source = (asset.fileName ?? asset.uri).toLowerCase();

  if (source.endsWith('.jpg') || source.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  if (source.endsWith('.png')) {
    return 'image/png';
  }

  if (source.endsWith('.webp')) {
    return 'image/webp';
  }

  return null;
}

function getExtension(mimeType: 'image/jpeg' | 'image/png' | 'image/webp'): string {
  switch (mimeType) {
    case 'image/png':
      return 'png';

    case 'image/webp':
      return 'webp';

    default:
      return 'jpg';
  }
}

function createUploadFile(asset: ImagePicker.ImagePickerAsset): UploadWorkOrderAttachmentFile {
  const mimeType = getMimeType(asset);

  if (!mimeType) {
    throw new Error('Format gambar harus JPEG, PNG, atau WEBP.');
  }

  if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE) {
    throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  const extension = getExtension(mimeType);

  return {
    uri: asset.uri,

    name: asset.fileName ?? `evidence-${Date.now()}.${extension}`,

    type: mimeType,
  };
}

export function TechnicianEvidenceUpload({ workOrder, onUploaded }: Props) {
  const [selectedAsset, setSelectedAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [description, setDescription] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const evidenceType = getEvidenceType(workOrder);

  if (!evidenceType) {
    return null;
  }

  const activeEvidenceType: AttachmentType = evidenceType;

  async function handleAsset(asset: ImagePicker.ImagePickerAsset | undefined) {
    if (!asset) {
      return;
    }

    try {
      createUploadFile(asset);

      setSelectedAsset(asset);
      setErrorMessage(null);
    } catch (error) {
      setSelectedAsset(null);

      setErrorMessage(error instanceof Error ? error.message : 'Gambar tidak dapat digunakan');
    }
  }

  async function takePhoto() {
    try {
      setErrorMessage(null);

      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Izin kamera diperlukan', 'Berikan akses kamera agar OpsMate dapat mengambil foto evidence.');

        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      await handleAsset(result.assets[0]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Kamera gagal dibuka');
    }
  }

  async function pickFromGallery() {
    try {
      setErrorMessage(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Izin galeri diperlukan', 'Berikan akses galeri agar OpsMate dapat memilih foto evidence.');

        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
        selectionLimit: 1,
      });

      if (result.canceled) {
        return;
      }

      await handleAsset(result.assets[0]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Galeri gagal dibuka');
    }
  }

  async function handleUpload() {
    if (!selectedAsset || isUploading) {
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      const file = createUploadFile(selectedAsset);

      const response = await uploadTechnicianWorkOrderAttachment(workOrder.id, {
        attachmentType: activeEvidenceType,

        description: description.trim() || undefined,

        file,
      });

      setSelectedAsset(null);
      setDescription('');

      await onUploaded();

      Alert.alert('Evidence berhasil', response.message);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Evidence gagal diunggah');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <View>
      <View style={styles.typeHeader}>
        <View style={[styles.typeIcon, activeEvidenceType === 'BEFORE' ? styles.beforeIcon : styles.afterIcon]}>
          <Feather name={activeEvidenceType === 'BEFORE' ? 'camera' : 'check-square'} size={20} color={activeEvidenceType === 'BEFORE' ? '#1D4ED8' : '#166534'} />
        </View>

        <View style={styles.typeContent}>
          <Text style={styles.typeTitle}>Evidence {activeEvidenceType}</Text>

          <Text style={styles.typeDescription}>{activeEvidenceType === 'BEFORE' ? 'Ambil foto kondisi sebelum pekerjaan dimulai.' : 'Ambil foto hasil setelah pekerjaan selesai dikerjakan.'}</Text>
        </View>
      </View>

      {!selectedAsset ? (
        <View style={styles.sourceButtons}>
          <Pressable
            onPress={() => {
              void takePhoto();
            }}
            style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}
          >
            <Feather name="camera" size={20} color="#111827" />

            <Text style={styles.sourceButtonText}>Ambil Foto</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              void pickFromGallery();
            }}
            style={({ pressed }) => [styles.sourceButton, pressed && styles.pressed]}
          >
            <Feather name="image" size={20} color="#111827" />

            <Text style={styles.sourceButtonText}>Pilih Galeri</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.previewContainer}>
          <Image
            source={{
              uri: selectedAsset.uri,
            }}
            style={styles.previewImage}
            contentFit="cover"
          />

          <View style={styles.previewFooter}>
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedAsset.fileName ?? 'Evidence photo'}
              </Text>

              {selectedAsset.fileSize ? <Text style={styles.previewMeta}>{(selectedAsset.fileSize / 1024 / 1024).toFixed(2)} MB</Text> : null}
            </View>

            <Pressable
              disabled={isUploading}
              onPress={() => {
                setSelectedAsset(null);
              }}
              hitSlop={10}
            >
              <Feather name="x" size={21} color="#B91C1C" />
            </Pressable>
          </View>
        </View>
      )}

      <Text style={styles.inputLabel}>Deskripsi evidence</Text>

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder={activeEvidenceType === 'BEFORE' ? 'Contoh: Kondisi AC sebelum diperbaiki...' : 'Contoh: Kondisi AC setelah diperbaiki...'}
        placeholderTextColor="#9CA3AF"
        editable={!isUploading}
        multiline
        maxLength={1000}
        style={styles.descriptionInput}
      />

      <Text style={styles.counter}>{description.length}/1000</Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Feather name="alert-circle" size={17} color="#B91C1C" />

          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : null}

      <Pressable
        disabled={!selectedAsset || isUploading}
        onPress={() => {
          void handleUpload();
        }}
        style={({ pressed }) => [styles.uploadButton, (!selectedAsset || isUploading) && styles.uploadButtonDisabled, pressed && selectedAsset && !isUploading && styles.pressed]}
      >
        {isUploading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Feather name="upload-cloud" size={19} color="#FFFFFF" />

            <Text style={styles.uploadButtonText}>Upload Evidence {activeEvidenceType}</Text>
          </>
        )}
      </Pressable>

      <Text style={styles.hint}>JPEG, PNG, atau WEBP • Maksimal 5 MB</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  typeIcon: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  beforeIcon: {
    backgroundColor: '#DBEAFE',
  },

  afterIcon: {
    backgroundColor: '#DCFCE7',
  },

  typeContent: {
    flex: 1,
    marginLeft: 12,
  },

  typeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },

  typeDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  sourceButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  sourceButton: {
    flex: 1,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
  },

  sourceButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },

  pressed: {
    opacity: 0.7,
  },

  previewContainer: {
    overflow: 'hidden',
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  previewImage: {
    width: '100%',
    height: 220,
    backgroundColor: '#E5E7EB',
  },

  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },

  previewInfo: {
    flex: 1,
    marginRight: 10,
  },

  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },

  previewMeta: {
    marginTop: 3,
    fontSize: 11,
    color: '#9CA3AF',
  },

  inputLabel: {
    marginTop: 18,
    marginBottom: 7,
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  descriptionInput: {
    minHeight: 88,
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

  uploadButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 16,
    borderRadius: 13,
    backgroundColor: '#111827',
  },

  uploadButtonDisabled: {
    opacity: 0.4,
  },

  uploadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  hint: {
    marginTop: 9,
    textAlign: 'center',
    fontSize: 11,
    color: '#9CA3AF',
  },
});
