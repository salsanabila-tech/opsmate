import Feather from '@expo/vector-icons/Feather';
import { Image } from 'expo-image';

import { StyleSheet, Text, View } from 'react-native';

import type { WorkOrderAttachment } from '../types/work-order';

import { formatWorkOrderDate } from '../utils/date';

import { formatFileSize } from '../utils/file';

import { resolveFileUrl } from '../utils/file-url';

type Props = {
  attachment: WorkOrderAttachment;
};

export function WorkOrderAttachmentCard({ attachment }: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{
          uri: resolveFileUrl(attachment.fileUrl),
        }}
        style={styles.image}
        contentFit="cover"
        transition={150}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.badge, attachment.attachmentType === 'BEFORE' ? styles.beforeBadge : attachment.attachmentType === 'AFTER' ? styles.afterBadge : styles.otherBadge]}>
            <Text style={styles.badgeText}>{attachment.attachmentType}</Text>
          </View>

          <Text style={styles.fileSize}>{formatFileSize(attachment.fileSize)}</Text>
        </View>

        <Text style={styles.fileName} numberOfLines={1}>
          {attachment.fileName}
        </Text>

        {attachment.description ? <Text style={styles.description}>{attachment.description}</Text> : null}

        <View style={styles.metaRow}>
          <Feather name="clock" size={13} color="#9CA3AF" />

          <Text style={styles.metaText}>{formatWorkOrderDate(attachment.createdAt)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
  },

  image: {
    width: '100%',
    height: 190,
    backgroundColor: '#E5E7EB',
  },

  content: {
    padding: 14,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  beforeBadge: {
    backgroundColor: '#DBEAFE',
  },

  afterBadge: {
    backgroundColor: '#DCFCE7',
  },

  otherBadge: {
    backgroundColor: '#F3F4F6',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
  },

  fileSize: {
    fontSize: 12,
    color: '#9CA3AF',
  },

  fileName: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  description: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: '#6B7280',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },

  metaText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});
