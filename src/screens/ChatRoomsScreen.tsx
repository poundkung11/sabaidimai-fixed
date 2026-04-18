import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { getCommunityRooms, type CommunityRoom } from '../services/api';

function formatRoomPreview(room: CommunityRoom) {
  if (room.last_message) {
    return room.last_message;
  }

  return room.description;
}

function formatMemberCount(room: CommunityRoom) {
  if (room.members_count <= 0) {
    return 'ยังไม่มีสมาชิก';
  }

  return `${room.members_count} คน`;
}

export function ChatRoomsScreen() {
  const navigation = useNavigation<any>();
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRooms = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setIsLoading(true);
    }

    setError(null);

    try {
      const data = await getCommunityRooms();
      setRooms(data);
    } catch (loadError) {
      console.warn('Failed to load community rooms', loadError);
      setError('ยังโหลดห้องแชตจาก backend ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadRooms(true);
  }, [loadRooms]);

  const handleRefresh = () => {
    setRefreshing(true);
    void loadRooms(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })}
          style={styles.headerLeft}
        >
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ห้องแชต</Text>
          <Text style={styles.headerSubtitle}>โหลดรายชื่อห้องจาก backend ของระบบ</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.stateTitle}>กำลังโหลดห้องแชต...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.inner}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.privacyBox}>
            <ShieldCheck size={20} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={styles.privacyContent}>
              <Text style={styles.privacyTitle}>กติกาความเป็นส่วนตัว</Text>
              <View style={styles.privacyItem}>
                <View style={styles.bullet} />
                <Text style={styles.privacyItemText}>ข้อความทุกห้องถูกเก็บผ่าน backend เพื่อให้ประวัติไม่หาย</Text>
              </View>
              <View style={styles.privacyItem}>
                <View style={styles.bullet} />
                <Text style={styles.privacyItemText}>เข้าห้องครั้งแรก ระบบจะเพิ่มคุณเป็นสมาชิกของห้องนั้นอัตโนมัติ</Text>
              </View>
              <View style={styles.privacyItem}>
                <View style={styles.bullet} />
                <Text style={styles.privacyItemText}>ไม่แสดงตำแหน่งแบบละเอียด แม้จะเป็นห้องชุมชนก็ตาม</Text>
              </View>
            </View>
          </View>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorTitle}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={() => void loadRooms(true)}>
                <Text style={styles.retryBtnText}>ลองใหม่</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.rooms}>
            {rooms.map((room) => (
              <TouchableOpacity
                key={room.id}
                style={styles.roomCard}
                onPress={() =>
                  navigation.navigate('ChatRoom', {
                    roomId: room.id,
                    roomName: room.name,
                    roomIcon: room.icon,
                    conversationId: room.conversation_id ?? undefined,
                  })
                }
              >
                <View style={[styles.roomIcon, { backgroundColor: `${room.color}33` }]}>
                  <Text style={styles.roomEmoji}>{room.icon}</Text>
                </View>
                <View style={styles.roomInfo}>
                  <View style={styles.roomHeader}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <View style={styles.membersRow}>
                      <Users size={14} color={colors.mutedForeground} />
                      <Text style={styles.membersText}>{formatMemberCount(room)}</Text>
                    </View>
                  </View>
                  <Text style={styles.roomDesc}>{formatRoomPreview(room)}</Text>
                  <Text style={styles.roomMeta}>
                    {room.messages_count > 0
                      ? `มี ${room.messages_count} ข้อความในห้องนี้`
                      : 'ยังไม่มีข้อความในห้องนี้'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {!error && rooms.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.stateTitle}>ยังไม่มีห้องแชตจาก backend</Text>
              <Text style={styles.stateHint}>ตรวจสอบว่า backend รันอยู่และ endpoint `/api/app/community-rooms` ตอบกลับได้</Text>
            </View>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
    gap: 12,
  },
  headerLeft: {},
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.medium },
  headerSubtitle: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 24 },
  stateTitle: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium, textAlign: 'center' },
  stateHint: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
  },
  privacyBox: {
    backgroundColor: colors.primary5,
    borderWidth: 1,
    borderColor: colors.primary20,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  privacyContent: { flex: 1 },
  privacyTitle: { fontSize: 14, color: colors.foreground, marginBottom: 8, fontFamily: fonts.medium },
  privacyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 7 },
  privacyItemText: { fontSize: 12, color: colors.mutedForeground, flex: 1, fontFamily: fonts.regular },
  errorBox: {
    backgroundColor: colors.destructive10,
    borderWidth: 1,
    borderColor: colors.destructive20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  errorTitle: { fontSize: 13, color: colors.foreground, fontFamily: fonts.medium },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryBtnText: { fontSize: 12, color: colors.foreground, fontFamily: fonts.medium },
  rooms: { gap: 12 },
  roomCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  roomIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roomEmoji: { fontSize: 22 },
  roomInfo: { flex: 1, gap: 4 },
  roomHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 2, gap: 8 },
  roomName: { flex: 1, fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 },
  membersText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  roomDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  roomMeta: { fontSize: 11, color: colors.primary, fontFamily: fonts.regular, marginTop: 4 },
  emptyBox: { paddingVertical: 32, gap: 8 },
});
