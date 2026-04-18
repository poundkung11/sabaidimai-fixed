/**
 * UserListItem.tsx — รายการผู้ใช้ในหน้าค้นหา / รายชื่อเพื่อน
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { UserPlus, Check, Clock, UserMinus, MessageCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import type { AppUser, SearchResult } from '../services/chatApi';

type ActionType = 'add' | 'pending_sent' | 'pending_received' | 'friends' | 'none';

interface UserListItemProps {
  user: AppUser;
  actionType?: ActionType;
  loading?: boolean;
  onAdd?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  onMessage?: () => void;
  onUnfriend?: () => void;
}

export function UserListItem({ user, actionType = 'none', loading = false, onAdd, onAccept, onReject, onMessage, onUnfriend }: UserListItemProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.avatar, { backgroundColor: user.avatarColor }]}>
        <Text style={styles.avatarText}>{user.initials}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio ? <Text style={styles.bio} numberOfLines={1}>{user.bio}</Text> : null}
      </View>

      <View style={styles.actions}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : actionType === 'add' ? (
          <TouchableOpacity style={styles.btn} onPress={onAdd}>
            <UserPlus size={16} color={colors.white} />
            <Text style={styles.btnText}>เพิ่มเพื่อน</Text>
          </TouchableOpacity>
        ) : actionType === 'pending_sent' ? (
          <View style={[styles.btn, styles.btnGhost]}>
            <Clock size={16} color={colors.mutedForeground} />
            <Text style={styles.btnTextGhost}>รอรับ</Text>
          </View>
        ) : actionType === 'pending_received' ? (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnSmall, styles.btnAccept]} onPress={onAccept}>
              <Check size={14} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnSmall, styles.btnReject]} onPress={onReject}>
              <UserMinus size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
        ) : actionType === 'friends' ? (
          <TouchableOpacity style={[styles.btn, styles.btnOutline]} onPress={onMessage}>
            <MessageCircle size={16} color={colors.primary} />
            <Text style={styles.btnTextOutline}>แชท</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  info: { flex: 1, gap: 2 },
  displayName: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium },
  username: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  bio: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular, marginTop: 2 },
  actions: { flexShrink: 0, alignItems: 'flex-end' },
  row: { flexDirection: 'row', gap: 8 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  btnText: { color: colors.white, fontSize: 13, fontFamily: fonts.medium },
  btnGhost: { backgroundColor: colors.border },
  btnTextGhost: { color: colors.mutedForeground, fontSize: 13, fontFamily: fonts.regular },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  btnTextOutline: { color: colors.primary, fontSize: 13, fontFamily: fonts.medium },
  btnSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnAccept: { backgroundColor: colors.primary },
  btnReject: { backgroundColor: colors.border },
});
