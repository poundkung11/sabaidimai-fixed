/**
 * ConversationItem.tsx — รายการห้องแชทในหน้า inbox
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { Conversation } from '../services/chatApi';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: () => void;
}

function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'เมื่อกี้';
    if (m < 60) return `${m} นาทีที่แล้ว`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
    const d = Math.floor(h / 24);
    if (d < 7)  return `${d} วันที่แล้ว`;
    return new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
  } catch { return ''; }
}

export function ConversationItem({ conversation: c, onPress }: ConversationItemProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.avatar, { backgroundColor: c.avatarColor }]}>
        <Text style={styles.avatarText}>{c.initials}</Text>
        {c.type === 'direct' && c.otherUser && (
          <View style={styles.onlineDot} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
          {c.lastMessageAt && (
            <Text style={styles.time}>{timeAgo(c.lastMessageAt)}</Text>
          )}
        </View>
        <View style={styles.bottomRow}>
          <Text style={[styles.preview, c.unreadCount > 0 && styles.previewBold]} numberOfLines={1}>
            {c.lastMessage || 'ยังไม่มีข้อความ'}
          </Text>
          {c.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{c.unreadCount > 99 ? '99+' : c.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: colors.card,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.medium,
  },
  time: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    flexShrink: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },
  previewBold: {
    color: colors.foreground,
    fontFamily: fonts.medium,
  },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontFamily: fonts.medium,
  },
});
