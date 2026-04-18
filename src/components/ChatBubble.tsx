/**
 * ChatBubble.tsx — ฟองข้อความสำหรับ user-to-user chat
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface ChatBubbleProps {
  content: string;
  sentAt: string;
  isOwn: boolean;
  senderName?: string;
  avatarColor?: string;
  initials?: string;
  showAvatar?: boolean;
}

export function ChatBubble({ content, sentAt, isOwn, senderName, avatarColor = '#7FA882', initials = '??', showAvatar = true }: ChatBubbleProps) {
  const time = (() => {
    try { return new Date(sentAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }); }
    catch { return sentAt; }
  })();

  return (
    <View style={[styles.row, isOwn && styles.rowOwn]}>
      {!isOwn && showAvatar && (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
      )}

      <View style={[styles.content, isOwn && styles.contentOwn]}>
        {!isOwn && senderName && (
          <Text style={styles.senderName}>{senderName}</Text>
        )}
        <View style={[styles.bubble, isOwn && styles.bubbleOwn]}>
          <Text style={[styles.text, isOwn && styles.textOwn]}>{content}</Text>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>{time}</Text>
        </View>
      </View>

      {isOwn && <View style={styles.avatarPlaceholder} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 4,
  },
  rowOwn: {
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: colors.white,
    fontSize: 12,
    fontFamily: fonts.medium,
  },
  avatarPlaceholder: {
    width: 36,
    flexShrink: 0,
  },
  content: {
    maxWidth: '72%',
    alignItems: 'flex-start',
  },
  contentOwn: {
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    marginBottom: 3,
    marginLeft: 4,
  },
  bubble: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderWidth: 0,
    borderRadius: 18,
    borderBottomRightRadius: 4,
  },
  text: {
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  textOwn: {
    color: colors.white,
  },
  time: {
    fontSize: 10,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.65)',
  },
});
