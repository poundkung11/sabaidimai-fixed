/**
 * ChatRoomsScreen.tsx — inbox ส่วนตัว + ห้องแชทชุมชน
 * screens/chat/ChatRoomsScreen.tsx
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, UserSearch, Users, ShieldCheck, UserPlus } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ConversationItem } from '../../components/ConversationItem';
import { getConversations, type Conversation } from '../../services/chatApi';

const communityRooms = [
  { id: 'general',        name: 'ทั่วไป',              desc: 'พูดคุยทั่วไปและแบ่งปันเรื่องราว',       members: 234, icon: '💬', color: '#7FA882' },
  { id: 'living-alone',   name: 'อยู่คนเดียว',          desc: 'แบ่งปันประสบการณ์และให้กำลังใจ',        members: 156, icon: '🏠', color: '#6B9AB1' },
  { id: 'senior-care',    name: 'ดูแลผู้สูงอายุ',       desc: 'แชร์เคล็ดลับและคำแนะนำ',               members: 98,  icon: '👵', color: '#D9A95F' },
  { id: 'mental-support', name: 'กำลังใจและสุขภาพใจ',  desc: 'พื้นที่ปลอดภัยสำหรับแบ่งปันความรู้สึก', members: 187, icon: '💚', color: '#22C55E' },
  { id: 'nearby',         name: 'พื้นที่ใกล้คุณ',       desc: 'เชื่อมต่อกับผู้คนในพื้นที่เดียวกัน',   members: 67,  icon: '📍', color: '#B47C9E' },
];

type Tab = 'direct' | 'community';

export function ChatRoomsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<Tab>('direct');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (e) {
      console.warn('Failed to load conversations', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);

  const totalUnread = conversations.reduce((n, c) => n + c.unreadCount, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>แชท</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSub}>{totalUnread} ข้อความที่ยังไม่ได้อ่าน</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('FriendRequests')} style={styles.iconBtn}>
          <UserPlus size={22} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('SearchUser')} style={styles.iconBtn}>
          <UserSearch size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'direct' && styles.tabActive]}
          onPress={() => setTab('direct')}
        >
          <Text style={[styles.tabText, tab === 'direct' && styles.tabTextActive]}>ส่วนตัว</Text>
          {totalUnread > 0 && tab !== 'direct' && (
            <View style={styles.tabBadge}><Text style={styles.tabBadgeText}>{totalUnread}</Text></View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'community' && styles.tabActive]}
          onPress={() => setTab('community')}
        >
          <Text style={[styles.tabText, tab === 'community' && styles.tabTextActive]}>ชุมชน</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {tab === 'direct' ? (
        isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>ยังไม่มีการสนทนา</Text>
            <Text style={styles.emptyHint}>ค้นหาเพื่อนและเริ่มแชทได้เลย</Text>
            <TouchableOpacity style={styles.findBtn} onPress={() => navigation.navigate('SearchUser')}>
              <UserSearch size={16} color={colors.white} />
              <Text style={styles.findBtnText}>ค้นหาเพื่อน</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={c => String(c.id)}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void loadConversations(); }} tintColor={colors.primary} />}
            renderItem={({ item }) => (
              <ConversationItem
                conversation={item}
                onPress={() => navigation.navigate('DirectChat', {
                  conversationId: item.id,
                  otherUser: item.otherUser,
                })}
              />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )
      ) : (
        <ScrollView contentContainerStyle={styles.communityInner}>
          <View style={styles.privacyBox}>
            <ShieldCheck size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.privacyTitle}>🔒 กติกาความเป็นส่วนตัว</Text>
              {['ไม่มีการแชร์ตำแหน่งแบบ real-time', 'ชื่อผู้ใช้แบบไม่ระบุตัวตน', 'รายงานหรือบลอกผู้ใช้ได้'].map((t, i) => (
                <View key={i} style={styles.privacyItem}>
                  <View style={styles.bullet} />
                  <Text style={styles.privacyText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          {communityRooms.map(room => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => navigation.navigate('ChatRoom', { roomId: room.id, roomName: room.name, roomIcon: room.icon })}
            >
              <View style={[styles.roomIcon, { backgroundColor: room.color + '33' }]}>
                <Text style={styles.roomEmoji}>{room.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <View style={styles.membersRow}>
                    <Users size={13} color={colors.mutedForeground} />
                    <Text style={styles.membersText}>{room.members}</Text>
                  </View>
                </View>
                <Text style={styles.roomDesc}>{room.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium },
  headerSub: { fontSize: 12, color: colors.primary, fontFamily: fonts.regular },
  iconBtn: { padding: 4 },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  tabTextActive: { color: colors.primary, fontFamily: fonts.medium },
  tabBadge: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { color: colors.white, fontSize: 10, fontFamily: fonts.medium },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium },
  emptyHint: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  findBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  findBtnText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
  communityInner: { padding: 20, gap: 12 },
  privacyBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.primary5 ?? '#f0fdf4',
    borderWidth: 1,
    borderColor: colors.primary20 ?? '#bbf7d0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 4,
  },
  privacyTitle: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium, marginBottom: 6 },
  privacyItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary },
  privacyText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular, flex: 1 },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
  },
  roomIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  roomEmoji: { fontSize: 22 },
  roomHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membersText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  roomDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular, lineHeight: 18 },
});
